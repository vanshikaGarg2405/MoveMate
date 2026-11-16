
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Handshake,
  Clock,
  MapPin,
  Pencil,
  PauseCircle,
  PlayCircle,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";

import {
  getMyServices,
  updateServiceStatus,
} from "../services/serviceService";

const statusStyles = {
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  closed: "bg-slate-200 text-slate-600",
};

function MyServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [processingId, setProcessingId] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyServices();

      if (response.success) {
        setServices(response.services || []);
      } else {
        setError(response.message || "Unable to fetch your services.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while fetching your services."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleStatusChange = async (service) => {
    const nextStatus =
      service.status === "active" ? "paused" : "active";

    const action = nextStatus === "paused" ? "pause" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${service.title}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(service._id);
      setActionError("");
      setActionMessage("");

      const response = await updateServiceStatus(
        service._id,
        nextStatus
      );

      if (!response.success) {
        setActionError(
          response.message || "Unable to update service status."
        );
        return;
      }

      setActionMessage(response.message || "Service status updated.");
      await fetchServices();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Something went wrong while updating service status."
      );
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        <Link
          to="/marketplace"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to Marketplace
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Handshake size={26} />
              </div>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                My Services
              </h1>
            </div>

            <p className="text-sm text-slate-600">
              Manage the services you offer to your community.
            </p>
          </div>

          <Link
            to="/marketplace/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Offer a Service
          </Link>
        </div>

        {actionMessage && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {actionMessage}
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-600">
            <LoaderCircle size={24} className="animate-spin" />
            Loading your services...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />

            <p className="mb-4 text-sm text-red-700">{error}</p>

            <button
              onClick={fetchServices}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Handshake
              size={42}
              className="mx-auto mb-4 text-slate-400"
            />

            <h2 className="text-lg font-bold text-slate-800">
              You haven't offered any services yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Share your skills and find someone in the community
              who can exchange a service with you.
            </p>

            <Link
              to="/marketplace/create"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={17} />
              Create Your First Service
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">
                {services.length} {services.length === 1 ? "listing" : "listings"} found
              </p>

              <button
                onClick={fetchServices}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="p-5 sm:p-6">

                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                        {service.category}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          statusStyles[service.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                      {service.title}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {service.description}
                    </p>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Handshake size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span>
                          <strong>Seeking:</strong> {service.seeking}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={16} className="shrink-0 text-emerald-600" />
                        <span>{service.availability}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={16} className="shrink-0 text-emerald-600" />
                        <span className="capitalize">
                          {service.mode === "both"
                            ? "Online and in-person"
                            : service.mode}
                          {service.location ? ` · ${service.location}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">

                      {service.status !== "closed" ? (
                        <>
                          <Link
                            to={`/my-services/${service._id}/edit`}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil size={15} />
                            Edit
                          </Link>

                          <button
                            onClick={() => handleStatusChange(service)}
                            disabled={processingId === service._id}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              service.status === "active"
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            }`}
                          >
                            {processingId === service._id ? (
                              <LoaderCircle size={15} className="animate-spin" />
                            ) : service.status === "active" ? (
                              <PauseCircle size={15} />
                            ) : (
                              <PlayCircle size={15} />
                            )}

                            {service.status === "active" ? "Pause" : "Activate"}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">
                          This listing is permanently closed.
                        </span>
                      )}

                      <Link
                        to={`/marketplace/${service._id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyServices;
