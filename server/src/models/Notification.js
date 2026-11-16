
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // User who receives the notification.
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // User who triggered the notification.
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Notification category.
    type: {
      type: String,
      required: true,
      enum: [
        "exchange_request",
        "exchange_accepted",
        "exchange_rejected",
        "exchange_cancelled",
        "exchange_completion_pending",
        "exchange_completed",
      ],
    },

    // Short notification heading.
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Notification details.
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // Related exchange request, when applicable.
    relatedExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeRequest",
      default: null,
    },

    // Read/unread state.
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Time when the notification was read.
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Efficiently retrieve a user's notifications.
notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

// Efficiently retrieve unread notifications.
notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;
