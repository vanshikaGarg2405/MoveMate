
import api from "./api";

// ==========================================
// DIRECT SERVICE EXCHANGE API
// ==========================================

// Create an exchange request.
export const createExchangeRequest = async (exchangeData) => {
  const response = await api.post("/exchanges", exchangeData);

  return response.data;
};

// Get exchange requests sent by the logged-in user.
export const getMyExchangeRequests = async () => {
  const response = await api.get("/exchanges/my-requests");

  return response.data;
};

// Get exchange requests received by the logged-in user.
export const getReceivedExchangeRequests = async () => {
  const response = await api.get("/exchanges/received");

  return response.data;
};

// Accept or reject an exchange request.
export const updateExchangeRequestStatus = async (requestId, status) => {
  const response = await api.patch(
    `/exchanges/${requestId}/status`,
    { status }
  );

  return response.data;
};

// Cancel a pending exchange request.
export const cancelExchangeRequest = async (requestId) => {
  const response = await api.patch(
    `/exchanges/${requestId}/cancel`
  );

  return response.data;
};

// Confirm service exchange completion.
export const confirmExchangeCompletion = async (requestId) => {
  const response = await api.patch(
    `/exchanges/${requestId}/complete`
  );

  return response.data;
};
