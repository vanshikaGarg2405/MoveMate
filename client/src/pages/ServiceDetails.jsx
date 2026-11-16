
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Handshake,
  UserRound,
  LoaderCircle,
  AlertCircle,
  Send,
  CheckCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getServiceById,
  getMyServices,
} from "../services/serviceService";

import {
  createExchangeRequest,
} from "../services/exchangeService";

function ServiceDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myServices, setMyServices] = useState([]);
  const [loadingMyServices, setLoadingMyServices] = useState(true);
  const [myServicesError, setMyServicesError] = useState("");

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [exchangeError, setExchangeError] = useState("");
  const [exchangeSuccess, setExchangeSuccess] = useState("");

  // Fetch the selected marketplace service.
  useEffect(() => {
    let isMounted = true;

    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getServiceById(id);

        if (!isMounted) return;

        if (response.success && response.service) {
          setService(response.service);
        } else {
          setError(response.message || "Service not found.");
        }
      } catch (err) {
        if (!isMounted) return;

        setError(
          err.response?.data?.message ||
            "Unable to load service details."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchService();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Fetch the logged-in user's active service listings.
  useEffect(() => {
    let isMounted = true;

    const fetchMyServices = async () => {
      try {
        setLoadingMyServices(true);
        setMyServicesError("");

        const response = await getMyServices();

        if (!isMounted) return;

        if (response.success) {
          const activeServices = (response.services || []).filter(
            (item) => item.status === "active"
          );

          setMyServices(activeServices);
        } else {
          setMyServicesError(
            response.message || "Unable to load your services."
          );
        }
      } catch (err) {
        if (!isMounted) return;

        setMyServicesError(
          err.response?.data?.message ||
            "Unable to load your services."
        );
      } finally {
        if (isMounted) {
          setLoadingMyServices(false);
        }
      }
    };

    fetchMyServices();

    return () => {
      isMounted = false;
    };
  }, []);

  // Submit a direct service-for-service exchange request.
  const handleExchangeRequest = async (event) => {
    event.preventDefault();

    setExchangeError("");
    setExchangeSuccess("");

    if (!selectedServiceId) {
      setExchangeError("Please select a service to offer in exchange.");
      return;
    }

    if (selectedServiceId === service._id) {
      setExchangeError(
        "You cannot offer the same service that you are requesting."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await createExchangeRequest({
        requestedListingId: service._id,
        offeredListingId: selectedServiceId,
        message: message.trim(),
      });

      if (response.success) {
        setExchangeSuccess(
          response.message || "Exchange request sent successfully!"
        );

        setSelectedServiceId("");
        setMessage("");
      } else {
        setExchangeError(
          response.message || "Unable to send exchange request."
        );
      }
    } catch (err) {
      setExchangeError(
        err.response?.data?.message ||
          "Something went wrong while sending your exchange request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <LoaderCircle className="animate-spin" size={22} />
          Loading service details...
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-[60vh] bg-slate-100 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={35} />

          <h2 className="text-xl font-bold text-slate-900">
            Unable to Load Service
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {error || "This service may no longer be available."}
          </p>

          <Link
            to="/marketplace"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <ArrowLeft size={17} />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const providerName =
    service.offeredBy?.name || "Community member";

  const providerId = String(
    service.offeredBy?._id || service.offeredBy || ""
  );

  const currentUserId = String(user?._id || user?.id || "");

  const isOwnService =
    currentUserId && providerId === currentUserId;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        <Link
          to="/marketplace"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to Marketplace
        </Link>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Service Header */}
          <div className="bg-gradient-to-r from-slate-950 to-emerald-900 p-6 text-white sm:p-8">
            <span className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold capitalize text-emerald-300">
              {service.category}
            </span>

            <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
              {service.title}
            </h1>

            <p className="mt-3 text-sm text-slate-300">
              Offered by {providerName}
            </p>
          </div>

          <div className="space-y-7 p-6 sm:p-8">

            {/* Service Description */}
            <section>
              <h2 className="text-lg font-bold text-slate-900">
                About This Service
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {service.description}
              </p>
            </section>

            {/* Exchange Requirement */}
            <section className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 text-emerald-700">
                <Handshake size={20} />

                <h2 className="font-bold">
                  Looking for in Return
                </h2>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700">
                {service.seeking}
              </p>
            </section>

            {/* Service Information */}
            <section className="grid gap-5 border-y border-slate-100 py-6 sm:grid-cols-2">

              <div className="flex items-start gap-3">
                <UserRound
                  className="mt-1 text-emerald-600"
                  size={19}
                />

                <div>
                  <p className="text-xs text-slate-500">
                    Service Provider
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {providerName}
                  </p>

                  {service.offeredBy?.community && (
                    <p className="mt-1 text-xs text-slate-500">
                      {service.offeredBy.community}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock
                  className="mt-1 text-emerald-600"
                  size={19}
                />

                <div>
                  <p className="text-xs text-slate-500">
                    Availability
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {service.availability}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  className="mt-1 text-emerald-600"
                  size={19}
                />

                <div>
                  <p className="text-xs text-slate-500">
                    Service Mode
                  </p>

                  <p className="mt-1 font-semibold capitalize text-slate-800">
                    {service.mode}
                  </p>

                  {service.mode !== "online" && service.location && (
                    <p className="mt-1 text-sm text-slate-500">
                      {service.location}
                    </p>
                  )}
                </div>
              </div>

            </section>

            {/* Exchange Request Form */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <Handshake size={23} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Request a Service Exchange
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Offer one of your services in return.
                  </p>
                </div>
              </div>

              {isOwnService ? (
                <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  This is your own service listing. You cannot request
                  an exchange with yourself.
                </div>
              ) : (
                <form
                  onSubmit={handleExchangeRequest}
                  className="mt-6 space-y-5"
                >

                  {/* Feedback Messages */}
                  {exchangeError && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      {exchangeError}
                    </div>
                  )}

                  {exchangeSuccess && (
                    <div
                      role="status"
                      className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                    >
                      <CheckCircle size={19} className="mt-0.5 shrink-0" />
                      {exchangeSuccess}
                    </div>
                  )}

                  {/* Select Own Service */}
                  <div>
                    <label
                      htmlFor="offeredService"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Select Your Service to Offer *
                    </label>

                    {loadingMyServices ? (
                      <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-500">
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                        Loading your services...
                      </div>
                    ) : myServicesError ? (
                      <div
                        role="alert"
                        className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                      >
                        {myServicesError}
                      </div>
                    ) : myServices.length === 0 ? (
                      <div className="mt-2 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                        You don't have any active services to offer.
                        Create a service in the Marketplace first.
                        <Link
                          to="/marketplace/create"
                          className="mt-2 block font-semibold underline"
                        >
                          Offer a Service
                        </Link>
                      </div>
                    ) : (
                      <select
                        id="offeredService"
                        value={selectedServiceId}
                        onChange={(event) => {
                          setSelectedServiceId(event.target.value);
                          setExchangeError("");
                          setExchangeSuccess("");
                        }}
                        required
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      >
                        <option value="">
                          Choose one of your services
                        </option>

                        {myServices
                          .filter((item) => item._id !== service._id)
                          .map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.title} — {item.category}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>

                  {/* Optional Message */}
                  <div>
                    <label
                      htmlFor="exchangeMessage"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Message to Service Provider (Optional)
                    </label>

                    <textarea
                      id="exchangeMessage"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Introduce yourself and explain why you are interested in this exchange..."
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />

                    <p className="mt-1 text-right text-xs text-slate-400">
                      {message.length}/500 characters
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      loadingMyServices ||
                      !!myServicesError ||
                      myServices.filter(
                        (item) => item._id !== service._id
                      ).length === 0
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Send Exchange Request
                      </>
                    )}
                  </button>

                  <p className="text-xs leading-5 text-slate-500">
                    MoveMate supports direct service-for-service
                    exchanges. No credits or money are involved.
                  </p>

                </form>
              )}
            </section>

          </div>
        </article>
      </div>
    </div>
  );
}

export default ServiceDetails;
