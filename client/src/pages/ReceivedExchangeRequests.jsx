
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Handshake,
  Clock,
  CheckCircle,
  XCircle,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  UserCircle,
  Check,
} from "lucide-react";

import {
  getReceivedExchangeRequests,
  updateExchangeRequestStatus,
  confirmExchangeCompletion,
} from "../services/exchangeService";

function ReceivedExchangeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState("");

  // Fetch received exchange requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getReceivedExchangeRequests();

      if (response.success) {
        setRequests(response.requests || []);
      } else {
        setError(response.message || "Unable to load received requests.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while loading requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Accept or reject an exchange request
  const handleStatusUpdate = async (requestId, status) => {
    const actionLabel = status === "accepted" ? "accept" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} this exchange request?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(requestId);
      setActionError("");

      const response = await updateExchangeRequestStatus(
        requestId,
        status
      );

      if (!response.success) {
        throw new Error(
          response.message || "Unable to update the exchange request."
        );
      }

      await fetchRequests();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while updating the request."
      );
    } finally {
      setProcessingId("");
    }
  };

  // Provider confirms completion of their service
  const handleCompletionConfirmation = async (requestId) => {
    const confirmed = window.confirm(
      "Have you completed your part of this service exchange?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(requestId);
      setActionError("");

      const response = await confirmExchangeCompletion(requestId);

      if (!response.success) {
        throw new Error(
          response.message || "Unable to confirm completion."
        );
      }

      await fetchRequests();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while confirming completion."
      );
    } finally {
      setProcessingId("");
    }
  };

  // Status badge styling
  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700",
      accepted: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
      cancelled: "bg-slate-100 text-slate-600",
      completed: "bg-blue-100 text-blue-700",
    };

    return styles[status] || "bg-slate-100 text-slate-600";
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCategory = (category = "") =>
    category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back Navigation */}
        <Link
          to="/marketplace"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-700"
        >
          <ArrowLeft size={17} />
          Back to Marketplace
        </Link>

        {/* Page Header */}
        <div className="mb-7 flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-950 to-emerald-900 p-6 text-white shadow-lg sm:p-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Your Barter Activity
            </p>

            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Received Exchange Requests
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Review requests from community members and manage your exchanges.
            </p>
          </div>

          <div className="hidden rounded-xl bg-emerald-800/70 p-4 sm:block">
            <Handshake size={32} className="text-emerald-300" />
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Incoming Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {requests.length} request(s) received
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Action Error */}
        {actionError && (
          <div
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} />
            {actionError}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <div className="text-center">
              <LoaderCircle
                size={34}
                className="mx-auto animate-spin text-emerald-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading received requests...
              </p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <AlertCircle
              size={36}
              className="mx-auto text-red-500"
            />

            <p className="mt-3 font-semibold text-slate-800">
              Unable to load requests
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              onClick={fetchRequests}
              className="mt-5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        ) : requests.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <Handshake
              size={48}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              No Received Requests Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              When community members request an exchange for one of your
              services, their requests will appear here.
            </p>

            <Link
              to="/marketplace"
              className="mt-6 inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Explore Marketplace
            </Link>
          </div>
        ) : (
          /* Request Cards */
          <div className="space-y-5">
            {requests.map((request) => {
              const isProcessing = processingId === request._id;

              return (
                <div
                  key={request._id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={14} />
                      Received on {formatDate(request.createdAt)}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="p-5">

                    {/* Requester Information */}
                    <div className="mb-5 flex items-center gap-3">
                      {request.requester?.profilePhoto ? (
                        <img
                          src={request.requester.profilePhoto}
                          alt={request.requester.name}
                          className="h-11 w-11 rounded-full border border-slate-200 object-cover"
                        />
                      ) : (
                        <UserCircle
                          size={42}
                          className="text-slate-400"
                        />
                      )}

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          REQUESTED BY
                        </p>

                        <p className="font-bold text-slate-900">
                          {request.requester?.name || "Community Member"}
                        </p>

                        {request.requester?.community && (
                          <p className="text-xs text-slate-500">
                            {request.requester.community}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Exchange Services */}
                    <div className="grid gap-4 md:grid-cols-2">

                      {/* Your Service */}
                      <div className="rounded-lg bg-emerald-50 p-4">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                          YOUR SERVICE REQUESTED
                        </p>

                        <h3 className="font-semibold text-slate-900">
                          {request.requestedListing?.title ||
                            "Service unavailable"}
                        </h3>

                        <p className="mt-1 text-xs text-slate-600">
                          {formatCategory(
                            request.requestedListing?.category
                          )}
                        </p>

                        {request.requestedListing?.seeking && (
                          <p className="mt-3 text-xs leading-relaxed text-slate-600">
                            Seeking: {request.requestedListing.seeking}
                          </p>
                        )}
                      </div>

                      {/* Requester's Offered Service */}
                      <div className="rounded-lg bg-blue-50 p-4">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                          SERVICE OFFERED BY REQUESTER
                        </p>

                        <h3 className="font-semibold text-slate-900">
                          {request.offeredListing?.title ||
                            "Service unavailable"}
                        </h3>

                        <p className="mt-1 text-xs text-slate-600">
                          {formatCategory(
                            request.offeredListing?.category
                          )}
                        </p>

                        {request.offeredListing?.seeking && (
                          <p className="mt-3 text-xs leading-relaxed text-slate-600">
                            Seeking: {request.offeredListing.seeking}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Request Message */}
                    {request.message && (
                      <div className="mt-4 rounded-lg bg-slate-50 p-4">
                        <p className="mb-2 text-xs font-semibold text-slate-600">
                          MESSAGE FROM REQUESTER
                        </p>

                        <p className="text-sm leading-relaxed text-slate-700">
                          {request.message}
                        </p>
                      </div>
                    )}

                    {/* Completed Status */}
                    {request.status === "completed" && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-700">
                        <CheckCircle size={18} />
                        Both members have confirmed this exchange as completed.
                      </div>
                    )}

                    {/* Accepted Status and Completion Confirmation */}
                    {request.status === "accepted" && (
                      <div className="mt-4 border-t border-slate-100 pt-4">

                        {!request.providerCompleted ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleCompletionConfirmation(request._id)
                            }
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isProcessing ? (
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={16} />
                            )}

                            Confirm My Completion
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                            <CheckCircle size={18} />

                            You have confirmed completion.

                            {request.requesterCompleted
                              ? " Both members have confirmed."
                              : " Waiting for the requester to confirm."}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pending Actions */}
                    {request.status === "pending" && (
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(request._id, "accepted")
                          }
                          disabled={isProcessing}
                          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isProcessing ? (
                            <LoaderCircle
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={16} />
                          )}

                          Accept Request
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(request._id, "rejected")
                          }
                          disabled={isProcessing}
                          className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle size={16} />
                          Reject Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReceivedExchangeRequests;
