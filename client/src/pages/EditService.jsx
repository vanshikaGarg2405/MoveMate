
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, LoaderCircle, AlertCircle } from "lucide-react";

import {
  getServiceById,
  updateService,
} from "../services/serviceService";

const categories = [
  "academics",
  "technology",
  "creative",
  "photography",
  "languages",
  "career",
  "fitness",
  "music",
  "other",
];

function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    seeking: "",
    availability: "",
    mode: "both",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getServiceById(id);

        if (!response.success) {
          throw new Error(response.message || "Unable to fetch service.");
        }

        if (response.service.status === "closed") {
          throw new Error("Closed service listings cannot be edited.");
        }

        const service = response.service;

        if (isMounted) {
          setFormData({
            title: service.title || "",
            category: service.category || "",
            description: service.description || "",
            seeking: service.seeking || "",
            availability: service.availability || "",
            mode: service.mode || "both",
            location: service.location || "",
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Something went wrong while fetching the service."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchService();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.mode === "in-person" && !formData.location.trim()) {
      setError("Please enter a location for in-person services.");
      return;
    }

    try {
      setSaving(true);

      const response = await updateService(id, {
        ...formData,
        location:
          formData.mode === "online"
            ? ""
            : formData.location.trim(),
      });

      if (response.success) {
        navigate("/my-services");
      } else {
        setError(response.message || "Unable to update your service.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while updating your service."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-slate-100 text-slate-600">
        <LoaderCircle size={24} className="animate-spin" />
        Loading service details...
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
          <AlertCircle size={34} className="mx-auto mb-3 text-red-500" />
          <p className="mb-6 text-sm text-red-700">{error}</p>
          <Link
            to="/my-services"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Back to My Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/my-services"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to My Services
        </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 to-emerald-900 p-6 text-white sm:p-8">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Edit Your Service
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Update your service details and what you would like
              in exchange.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="text-sm font-semibold text-slate-700">
                Service Title *
              </label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={100}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="category" className="text-sm font-semibold text-slate-700">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-semibold text-slate-700">
                Service Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                minLength={20}
                maxLength={1000}
                rows={4}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="seeking" className="text-sm font-semibold text-slate-700">
                What Would You Like in Exchange? *
              </label>
              <textarea
                id="seeking"
                name="seeking"
                value={formData.seeking}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={300}
                rows={3}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="availability" className="text-sm font-semibold text-slate-700">
                Availability *
              </label>
              <input
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                required
                maxLength={200}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="mode" className="text-sm font-semibold text-slate-700">
                Service Mode *
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="online">Online</option>
                <option value="in-person">In-person</option>
                <option value="both">Both online and in-person</option>
              </select>
            </div>

            {formData.mode !== "online" && (
              <div>
                <label htmlFor="location" className="text-sm font-semibold text-slate-700">
                  Location {formData.mode === "in-person" ? "*" : ""}
                </label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required={formData.mode === "in-person"}
                  maxLength={150}
                  className={inputClass}
                />
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <Link
                to="/my-services"
                className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditService;
