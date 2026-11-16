
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Handshake,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Check,
} from "lucide-react";

import {
  getMyExchangeRequests,
  confirmExchangeCompletion,
  cancelExchangeRequest,
} from "../services/exchangeService";

function MyExchangeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyExchangeRequests();

      if (response.success) {
        setRequests(response.requests || []);
      } else {
        setError(response.message || "Unable to load your exchange requests.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while loading exchange requests."
      );
    } finally {
      setLoading(false);
    }
  };

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

  const handleCancelRequest = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this exchange request?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(requestId);
      setActionError("");
      setActionMessage("");

      const response = await cancelExchangeRequest(requestId);

      if (!response.success) {
        throw new Error(
          response.message || "Unable to cancel the exchange request."
        );
      }

      setActionMessage(
        response.message || "Exchange request cancelled successfully."
      );

      await fetchRequests();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while cancelling the request."
      );
    } finally {
      setProcessingId("");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-600",
    completed: "bg-blue-100 text-blue-700",
  };

  const statusIcons = {
    pending: Clock,
    accepted: CheckCircle,
    rejected: XCircle,
    cancelled: Ban,
    completed: CheckCircle,
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <LoaderCircle className="animate-spin" size={22} />
          Loading your exchange requests...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        <Link
          to="/marketplace"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to Marketplace
        </Link>

        <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 to-emerald-900 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-emerald-300">
                YOUR BARTER ACTIVITY
              </p>

              <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                My Exchange Requests
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Track the services you have requested in exchange.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <Handshake size={30} />
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Sent Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {requests.length} request(s) found
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRequests}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {actionError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            {actionError}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!error && requests.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Handshake
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />

            <h3 className="text-lg font-bold text-slate-800">
              No Exchange Requests Yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Explore the marketplace and request a service exchange
              with another community member.
            </p>

            <Link
              to="/marketplace"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Explore Marketplace
            </Link>
          </div>
        )}

        <div className="grid gap-5">
          {requests.map((request) => {
            const status = request.status?.toLowerCase() || "pending";
            const StatusIcon = statusIcons[status] || Clock;

            const requestedService = request.requestedListing;
            const offeredService = request.offeredListing;

            return (
              <article
                key={request._id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <p className="text-xs text-slate-500">
                    Requested on {formatDate(request.createdAt)}
                  </p>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusStyles[status] || statusStyles.pending
                    }`}
                  >
                    <StatusIcon size={14} />
                    {status}
                  </span>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2">
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Service Requested
                    </p>

                    <h3 className="mt-2 font-bold text-slate-900">
                      {requestedService?.title || "Service unavailable"}
                    </h3>

                    <p className="mt-1 text-sm capitalize text-slate-500">
                      {requestedService?.category || ""}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      Provider:{" "}
                      {requestedService?.offeredBy?.name ||
                        "Community member"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Service Offered by You
                    </p>

                    <h3 className="mt-2 font-bold text-slate-900">
                      {offeredService?.title || "Service unavailable"}
                    </h3>

                    <p className="mt-1 text-sm capitalize text-slate-500">
                      {offeredService?.category || ""}
                    </p>
                  </div>
                </div>

                {request.message && (
                  <div className="mx-5 mb-5 rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Your Message
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {request.message}
                    </p>
                  </div>
                )}

                {/* Completion Confirmation */}
                {status === "accepted" && (
                  <div className="mx-5 mb-5 border-t border-slate-100 pt-4">

                    {request.requesterCompleted ? (
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                        <CheckCircle size={18} />

                        You have confirmed completion.
                        {request.providerCompleted
                          ? " Both members have confirmed."
                          : " Waiting for the provider to confirm."}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCompletionConfirmation(request._id)}
                        disabled={processingId === request._id}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {processingId === request._id ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Check size={17} />
                        )}

                        Confirm My Completion
                      </button>
                    )}
                  </div>
                )}

                {/* Cancel Exchange Request */}
                {["pending", "accepted"].includes(status) && (
                  <div className="mx-5 mb-5 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => handleCancelRequest(request._id)}
                      disabled={processingId === request._id}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {processingId === request._id ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Ban size={17} />
                      )}
                      Cancel Exchange
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default MyExchangeRequests;
