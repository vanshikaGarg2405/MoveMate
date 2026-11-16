
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Handshake, LoaderCircle } from "lucide-react";
import { createService } from "../services/serviceService";

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

function CreateService() {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setLoading(true);

      const response = await createService({
        ...formData,
        location: formData.mode === "online" ? "" : formData.location.trim(),
      });

      if (response.success) {
        navigate("/marketplace");
      } else {
        setError(response.message || "Unable to create your service.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while creating your service."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/marketplace"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to Marketplace
        </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 to-emerald-900 p-6 text-white sm:p-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <Handshake size={27} />
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Offer a Service
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Share your skills with the community and tell others what
              service you would like in exchange. No credits or money required.
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
                placeholder="e.g. Graphic Design Services"
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
                placeholder="Describe the service and skills you can provide..."
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">
                20–1000 characters
              </p>
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
                placeholder="e.g. I am looking for help with React and JavaScript..."
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
                placeholder="e.g. Weekends, 11 AM to 4 PM"
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
                  placeholder="e.g. Agra, Uttar Pradesh"
                  className={inputClass}
                />
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <Link
                to="/marketplace"
                className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Service"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateService;
