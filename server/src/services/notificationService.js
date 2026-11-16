
import Notification from "../models/Notification.js";
import { getIO } from "../config/socket.js";

const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  relatedExchange = null,
}) => {
  try {
    // 1. Save the notification in MongoDB
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedExchange,
    });

    // 2. Deliver it in real time through Socket.IO
    try {
      const io = getIO();

      io.to(`user:${recipient.toString()}`).emit(
        "new_notification",
        notification
      );
    } catch (socketError) {
      // Socket delivery failure must not undo the saved notification
      console.error("Real-time notification delivery failed:", socketError);
    }

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error);
    return null;
  }
};

export default createNotification;
