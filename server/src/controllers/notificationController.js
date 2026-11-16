
import mongoose from "mongoose";
import Notification from "../models/Notification.js";

// ==========================================
// 1. GET MY NOTIFICATIONS
// ==========================================

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
    })
      .populate("sender", "name profilePhoto")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch notifications",
    });
  }
};

// ==========================================
// 2. GET UNREAD NOTIFICATION COUNT
// ==========================================

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch unread notification count",
    });
  }
};

// ==========================================
// 3. MARK ONE NOTIFICATION AS READ
// ==========================================

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipient: req.user.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!notification) {
      const existingNotification = await Notification.exists({
        _id: id,
        recipient: req.user.userId,
      });

      if (!existingNotification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification already marked as read",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark notification as read",
    });
  }
};

// ==========================================
// 4. MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark all notifications as read",
    });
  }
};

// ==========================================
// 5. DELETE ONE NOTIFICATION
// ==========================================

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete notification",
    });
  }
};
