
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token || typeof token !== "string") {
      return next(new Error("Authentication required. Please log in."));
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return next(new Error("Authentication service is unavailable."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !mongoose.isValidObjectId(decoded.userId)
    ) {
      return next(new Error("Invalid authentication token."));
    }

    const user = await User.findById(decoded.userId)
      .select("+tokenVersion");

    if (!user || user.accountStatus !== "active") {
      return next(new Error("Account not found or inactive."));
    }

    const tokenVersion = decoded.tokenVersion ?? 0;
    const currentTokenVersion = user.tokenVersion ?? 0;

    if (
      !Number.isInteger(tokenVersion) ||
      tokenVersion !== currentTokenVersion
    ) {
      return next(new Error("Your session has expired. Please log in again."));
    }

    // Attach authenticated user information to the socket.
    socket.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new Error("Token has expired. Please log in again."));
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return next(new Error("Invalid authentication token."));
    }

    console.error("Socket authentication error:", error);

    return next(new Error("Authentication service temporarily unavailable."));
  }
};

export default socketAuthMiddleware;
