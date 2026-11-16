
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Handshake,
  MapPin,
  Clock,
  UserRound,
  RefreshCw,
  Plus,
} from "lucide-react";

import { getServices } from "../services/serviceService";

const categories = [
  { value: "", label: "All Categories" },
  { value: "academics", label: "Academics" },
  { value: "technology", label: "Technology" },
  { value: "creative", label: "Creative" },
  { value: "photography", label: "Photography" },
  { value: "languages", label: "Languages" },
  { value: "career", label: "Career" },
  { value: "fitness", label: "Fitness" },
  { value: "music", label: "Music" },
  { value: "other", label: "Other" },
];

function Marketplace() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};

      if (search.trim()) filters.search = search.trim();
      if (category) filters.category = category;
      if (mode) filters.mode = mode;

      const response = await getServices(filters);

      setServices(response.services || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load marketplace services. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [search, category, mode]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-slate-950 to-emerald-900 p-7 text-white shadow-lg sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <Handshake size={22} />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  MoveMate Community
                </span>
              </div>

              <h1 className="text-3xl font-extrabold sm:text-4xl">
                Barter Marketplace
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Share your skills, discover useful services and
                exchange your expertise directly with your community.
                No credits or money required.
              </p>
            </div>

            <Link
              to="/marketplace/create"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              <Plus size={19} />
              Offer a Service
            </Link>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">

            <div className="relative md:col-span-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">All Service Modes</option>
              <option value="online">Online</option>
              <option value="in-person">In Person</option>
              <option value="both">Online & In Person</option>
            </select>
          </div>
        </section>

        {/* Results Heading */}
        <section className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Available Services
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Discover what your community members are offering.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchServices}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </section>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-emerald-600"
            />
            <p className="mt-4 text-slate-500">
              Loading available services...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">{error}</p>

            <button
              onClick={fetchServices}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && services.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <Handshake
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-xl font-bold text-slate-800">
              No services found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No services match your current search.
              Try changing your filters or offer a service yourself.
            </p>

            <Link
              to="/marketplace/create"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={18} />
              Offer a Service
            </Link>
          </div>
        )}

        {/* Service Cards */}
        {!loading && !error && services.length > 0 && (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {services.length} service
              {services.length !== 1 ? "s" : ""} found
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                      {service.category}
                    </span>

                    <Handshake
                      size={22}
                      className="shrink-0 text-emerald-600"
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {service.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <div className="mt-5 rounded-lg bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                      Looking for in return
                    </p>

                    <p className="mt-2 text-sm font-medium leading-5 text-slate-700">
                      {service.seeking}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <UserRound size={16} />
                      <span>
                        {service.offeredBy?.name || "Community Member"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{service.availability}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>
                        {service.mode === "online"
                          ? "Online"
                          : service.mode === "in-person"
                          ? service.location || "In Person"
                          : "Online & In Person"}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/marketplace/${service._id}`}
                    className="mt-6 flex items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    View Service Details
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Marketplace;