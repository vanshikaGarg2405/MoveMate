
import api from "./api";

// ==========================================
// SERVICE MARKETPLACE API
// ==========================================

// Get all active service listings with optional filters.
export const getServices = async (filters = {}) => {
  const response = await api.get("/services", {
    params: filters,
  });

  return response.data;
};

// Get the logged-in user's service listings.
export const getMyServices = async () => {
  const response = await api.get("/services/my-services");

  return response.data;
};

// Get a single service listing by ID.
export const getServiceById = async (serviceId) => {
  const response = await api.get(`/services/${serviceId}`);

  return response.data;
};

// Create a new service listing.
export const createService = async (serviceData) => {
  const response = await api.post("/services", serviceData);

  return response.data;
};

// Update an existing service listing.
export const updateService = async (serviceId, serviceData) => {
  const response = await api.patch(
    `/services/${serviceId}`,
    serviceData
  );

  return response.data;
};

// Update service listing status.
export const updateServiceStatus = async (serviceId, status) => {
  const response = await api.patch(
    `/services/${serviceId}/status`,
    { status }
  );

  return response.data;
};
