
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RideFinder from "./pages/RideFinder";
import RideDetails from "./pages/RideDetails";
import MyBookings from "./pages/MyBookings";
import ManageBookings from "./pages/ManageBookings";
import MyRides from "./pages/MyRides";
import EditRide from "./pages/EditRide";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Marketplace from "./pages/Marketplace";
import CreateService from "./pages/CreateService";
import ServiceDetails from "./pages/ServiceDetails";
import MyExchangeRequests from "./pages/MyExchangeRequests";
import ReceivedExchangeRequests from "./pages/ReceivedExchangeRequests";
import MyServices from "./pages/MyServices";
import EditService from "./pages/EditService";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public pages */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Home />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Register />
        }
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* Protected pages with shared navigation */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Notifications */}
          <Route
            path="/notifications"
            element={<Notifications />}
          />

          {/* Ride management */}
          <Route path="/rides" element={<RideFinder />} />
          <Route path="/rides/:id" element={<RideDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route
            path="/manage-bookings/:rideId"
            element={<ManageBookings />}
          />
          <Route path="/my-rides" element={<MyRides />} />
          <Route path="/rides/:id/edit" element={<EditRide />} />

          {/* User profile */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Service barter marketplace */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/create" element={<CreateService />} />
          <Route path="/marketplace/:id" element={<ServiceDetails />} />
          <Route path="/my-services" element={<MyServices />} />
          <Route path="/my-services/:id/edit" element={<EditService />} />
          <Route
            path="/my-exchange-requests"
            element={<MyExchangeRequests />}
          />
          <Route
            path="/received-exchange-requests"
            element={<ReceivedExchangeRequests />}
          />
        </Route>
      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;