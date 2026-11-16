
import mongoose from "mongoose";
import ExchangeRequest from "../models/ExchangeRequest.js";
import ServiceListing from "../models/ServiceListing.js";
import createNotification from "../services/notificationService.js";

// ==========================================
// 1. CREATE AN EXCHANGE REQUEST
// ==========================================

export const createExchangeRequest = async (req, res) => {
  try {
    const {
      requestedListingId,
      offeredListingId,
      message,
    } = req.body;

    const requesterId = req.user.userId;

    if (
      !mongoose.isValidObjectId(requestedListingId) ||
      !mongoose.isValidObjectId(offeredListingId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid service listing ID",
      });
    }

    if (
      message !== undefined &&
      (typeof message !== "string" || message.trim().length > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: "Message must be a string of at most 500 characters",
      });
    }

    const requestedListing =
      await ServiceListing.findById(requestedListingId);

    if (!requestedListing || requestedListing.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Requested service listing not found or unavailable",
      });
    }

    if (
      requestedListing.offeredBy.toString() ===
      requesterId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own service",
      });
    }

    const offeredListing =
      await ServiceListing.findById(offeredListingId);

    if (!offeredListing || offeredListing.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Your offered service listing is unavailable",
      });
    }

    if (
      offeredListing.offeredBy.toString() !==
      requesterId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only offer your own service listing",
      });
    }

    if (
      requestedListing._id.toString() ===
      offeredListing._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You must offer a different service",
      });
    }

    const existingRequest = await ExchangeRequest.findOne({
      requester: requesterId,
      provider: requestedListing.offeredBy,
      requestedListing: requestedListing._id,
      offeredListing: offeredListing._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending request for this exchange",
      });
    }

    const exchangeRequest = await ExchangeRequest.create({
      requester: requesterId,
      provider: requestedListing.offeredBy,
      requestedListing: requestedListing._id,
      offeredListing: offeredListing._id,
      message: message?.trim() || "",
    });

    await createNotification({
      recipient: requestedListing.offeredBy,
      sender: requesterId,
      type: "exchange_request",
      title: "New Exchange Request",
      message: "Someone has requested your service. Open Received Requests to review it.",
      relatedExchange: exchangeRequest._id,
    });

    return res.status(201).json({
      success: true,
      message: "Exchange request created successfully",
      exchangeRequest,
    });
  } catch (error) {
    console.error("Create exchange request error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create exchange request",
    });
  }
};

// ==========================================
// 2. GET REQUESTS SENT BY LOGGED-IN USER
// ==========================================

export const getMyExchangeRequests = async (req, res) => {
  try {
    const requests = await ExchangeRequest.find({
      requester: req.user.userId,
    })
      .populate("provider", "name community profilePhoto")
      .populate("requestedListing", "title category seeking")
      .populate("offeredListing", "title category seeking")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my exchange requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your exchange requests",
    });
  }
};

// ==========================================
// 3. GET REQUESTS RECEIVED BY PROVIDER
// ==========================================

export const getReceivedExchangeRequests = async (req, res) => {
  try {
    const requests = await ExchangeRequest.find({
      provider: req.user.userId,
    })
      .populate("requester", "name community profilePhoto")
      .populate("requestedListing", "title category seeking")
      .populate("offeredListing", "title category seeking")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get received exchange requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch received exchange requests",
    });
  }
};

// ==========================================
// 4. ACCEPT OR REJECT AN EXCHANGE REQUEST
// ==========================================

export const updateExchangeRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exchange request ID",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected",
      });
    }

    // Only the provider can accept or reject.
    const exchangeRequest = await ExchangeRequest.findOne({
      _id: id,
      provider: req.user.userId,
    });

    if (!exchangeRequest) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    if (exchangeRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be updated",
      });
    }

    // Atomic conditional update prevents simultaneous decisions.
    const updatedRequest = await ExchangeRequest.findOneAndUpdate(
      {
        _id: id,
        provider: req.user.userId,
        status: "pending",
      },
      {
        $set: { status },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedRequest) {
      return res.status(409).json({
        success: false,
        message: "This request has already been processed",
      });
    }

    await createNotification({
      recipient: updatedRequest.requester,
      sender: req.user.userId,
      type:
        status === "accepted"
          ? "exchange_accepted"
          : "exchange_rejected",
      title:
        status === "accepted"
          ? "Exchange Request Accepted"
          : "Exchange Request Rejected",
      message:
        status === "accepted"
          ? "Your exchange request has been accepted. You can now coordinate your service exchange."
          : "Your exchange request was rejected.",
      relatedExchange: updatedRequest._id,
    });

    return res.status(200).json({
      success: true,
      message: `Exchange request ${status} successfully`,
      exchangeRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Update exchange status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update exchange request",
    });
  }
};

// ==========================================
// 5. CANCEL AN EXCHANGE REQUEST
// ==========================================

export const cancelExchangeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exchange request ID",
      });
    }

    const updatedRequest = await ExchangeRequest.findOneAndUpdate(
      {
        _id: id,
        requester: req.user.userId,
        status: "pending",
      },
      {
        $set: { status: "cancelled" },
      },
      {
        returnDocument: "after",
      }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Pending exchange request not found",
      });
    }

    await createNotification({
      recipient: updatedRequest.provider,
      sender: req.user.userId,
      type: "exchange_cancelled",
      title: "Exchange Request Cancelled",
      message: "The requester has cancelled their exchange request.",
      relatedExchange: updatedRequest._id,
    });

    return res.status(200).json({
      success: true,
      message: "Exchange request cancelled successfully",
      exchangeRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Cancel exchange request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel exchange request",
    });
  }
};

// ==========================================
// 6. CONFIRM SERVICE COMPLETION
// ==========================================


export const confirmExchangeCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exchange request ID",
      });
    }

    const userId = req.user.userId.toString();

    const exchangeRequest = await ExchangeRequest.findById(id);

    if (!exchangeRequest) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    const isRequester =
      exchangeRequest.requester.toString() === userId;

    const isProvider =
      exchangeRequest.provider.toString() === userId;

    if (!isRequester && !isProvider) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this exchange",
      });
    }

    if (exchangeRequest.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted exchanges can be completed",
      });
    }

    const completionField = isRequester
      ? "requesterCompleted"
      : "providerCompleted";

    // Atomically record confirmation and update exchange status.
    const updatedRequest = await ExchangeRequest.findOneAndUpdate(
      {
        _id: id,
        status: "accepted",
        [completionField]: false,
      },
      [
        {
          $set: {
            [completionField]: true,
          },
        },
        {
          $set: {
            status: {
              $cond: [
                {
                  $and: [
                    "$requesterCompleted",
                    "$providerCompleted",
                  ],
                },
                "completed",
                "accepted",
              ],
            },
          },
        },
      ],
      {
        returnDocument: "after",
        updatePipeline: true,
      }
    );

    if (!updatedRequest) {
      return res.status(409).json({
        success: false,
        message:
          "You have already confirmed completion or the exchange has changed",
      });
    }

    if (updatedRequest.status === "completed") {
      // Both participants have confirmed completion.
      await Promise.all([
        createNotification({
          recipient: updatedRequest.requester,
          sender: userId,
          type: "exchange_completed",
          title: "Exchange Completed",
          message: "Both participants have confirmed completion of the service exchange.",
          relatedExchange: updatedRequest._id,
        }),
        createNotification({
          recipient: updatedRequest.provider,
          sender: userId,
          type: "exchange_completed",
          title: "Exchange Completed",
          message: "Both participants have confirmed completion of the service exchange.",
          relatedExchange: updatedRequest._id,
        }),
      ]);
    } else {
      // The first participant confirmed. Notify the other participant.
      const otherParticipant = isRequester
        ? updatedRequest.provider
        : updatedRequest.requester;

      await createNotification({
        recipient: otherParticipant,
        sender: userId,
        type: "exchange_completion_pending",
        title: "Completion Confirmation Received",
        message: "The other participant has confirmed completion. Please confirm your side to complete the exchange.",
        relatedExchange: updatedRequest._id,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        updatedRequest.status === "completed"
          ? "Exchange completed successfully. Both students confirmed."
          : "Your completion confirmation was recorded. Waiting for the other student.",
      exchangeRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Confirm exchange completion error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to confirm exchange completion",
    });
  }
};
