
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Notification from "../../src/models/Notification.js";

describe("Notification API", () => {
  let recipient;
  let anotherUser;
  let sender;
  let recipientToken;
  let anotherUserToken;

  beforeEach(async () => {
    await Notification.deleteMany({});
    await User.deleteMany({});

    recipient = await User.create({
      name: "Priya Sharma",
      email: "priya.notification@test.com",
      password: "TestPassword123",
      phone: "9876543210",
      community: "Agra",
    });

    anotherUser = await User.create({
      name: "Aarav Sharma",
      email: "aarav.notification@test.com",
      password: "TestPassword123",
      phone: "9876543211",
      community: "Agra",
    });

    sender = await User.create({
      name: "Rahul Sharma",
      email: "rahul.notification@test.com",
      password: "TestPassword123",
      phone: "9876543212",
      community: "Agra",
    });

    recipientToken = jwt.sign(
      {
        userId: recipient._id,
        tokenVersion: recipient.tokenVersion,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    anotherUserToken = jwt.sign(
      {
        userId: anotherUser._id,
        tokenVersion: anotherUser.tokenVersion,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterEach(async () => {
    await Notification.deleteMany({});
    await User.deleteMany({});
  });

  const createTestNotification = async (overrides = {}) => {
    return Notification.create({
      recipient: recipient._id,
      sender: sender._id,
      type: "exchange_request",
      title: "New Exchange Request",
      message: "Someone has requested your service.",
      ...overrides,
    });
  };

  // ==========================================
  // 1. GET MY NOTIFICATIONS
  // ==========================================

  describe("GET /api/v1/notifications", () => {
    test("should return notifications belonging to the logged-in user", async () => {
      await createTestNotification();

      await createTestNotification({
        recipient: anotherUser._id,
        title: "Another User Notification",
      });

      const response = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.notifications).toHaveLength(1);

      expect(response.body.notifications[0].title).toBe(
        "New Exchange Request"
      );

      expect(response.body.notifications[0].sender.name).toBe(
        "Rahul Sharma"
      );
    });

    test("should return an empty list when no notifications exist", async () => {
      const response = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.notifications).toHaveLength(0);
    });

    test("should return notifications in newest-first order", async () => {
      await createTestNotification({
        title: "Older Notification",
        createdAt: new Date("2026-01-01T10:00:00Z"),
      });

      await createTestNotification({
        title: "Newer Notification",
        createdAt: new Date("2026-02-01T10:00:00Z"),
      });

      const response = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body.notifications[0].title).toBe(
        "Newer Notification"
      );

      expect(response.body.notifications[1].title).toBe(
        "Older Notification"
      );
    });

    test("should return a maximum of 50 notifications", async () => {
      await Notification.insertMany(
        Array.from({ length: 55 }, (_, index) => ({
          recipient: recipient._id,
          sender: sender._id,
          type: "exchange_request",
          title: `Notification ${index}`,
          message: "Test notification message.",
        }))
      );

      const response = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.notifications).toHaveLength(50);
      expect(response.body.count).toBe(50);
    });

    test("should reject an unauthenticated request", async () => {
      const response = await request(app).get(
        "/api/v1/notifications"
      );

      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================
  // 2. GET UNREAD NOTIFICATION COUNT
  // ==========================================

  describe("GET /api/v1/notifications/unread-count", () => {
    test("should return the correct unread notification count", async () => {
      await createTestNotification();
      await createTestNotification();
      await createTestNotification({
        isRead: true,
        readAt: new Date(),
      });

      const response = await request(app)
        .get("/api/v1/notifications/unread-count")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
    });

    test("should not count another user's unread notifications", async () => {
      await createTestNotification({
        recipient: anotherUser._id,
      });

      const response = await request(app)
        .get("/api/v1/notifications/unread-count")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.count).toBe(0);
    });

    test("should reject an unauthenticated request", async () => {
      const response = await request(app).get(
        "/api/v1/notifications/unread-count"
      );

      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================
  // 3. MARK ONE NOTIFICATION AS READ
  // ==========================================

  describe("PATCH /api/v1/notifications/:id/read", () => {
    test("should mark an unread notification as read", async () => {
      const notification = await createTestNotification();

      const response = await request(app)
        .patch(`/api/v1/notifications/${notification._id}/read`)
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.notification.isRead).toBe(true);
      expect(response.body.notification.readAt).not.toBeNull();

      const updatedNotification = await Notification.findById(
        notification._id
      );

      expect(updatedNotification.isRead).toBe(true);
      expect(updatedNotification.readAt).not.toBeNull();
    });

    test("should handle an already-read notification", async () => {
      const notification = await createTestNotification({
        isRead: true,
        readAt: new Date(),
      });

      const response = await request(app)
        .patch(`/api/v1/notifications/${notification._id}/read`)
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/already marked as read/i);
    });

    test("should reject an invalid notification ID", async () => {
      const response = await request(app)
        .patch("/api/v1/notifications/invalid-id/read")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(400);
    });

    test("should prevent reading another user's notification", async () => {
      const notification = await createTestNotification({
        recipient: anotherUser._id,
      });

      const response = await request(app)
        .patch(`/api/v1/notifications/${notification._id}/read`)
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(404);

      const unchangedNotification = await Notification.findById(
        notification._id
      );

      expect(unchangedNotification.isRead).toBe(false);
    });

    test("should return 404 for a nonexistent notification", async () => {
      const response = await request(app)
        .patch(
          "/api/v1/notifications/000000000000000000000000/read"
        )
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(404);
    });

    test("should reject an unauthenticated request", async () => {
      const notification = await createTestNotification();

      const response = await request(app).patch(
        `/api/v1/notifications/${notification._id}/read`
      );

      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================
  // 4. MARK ALL NOTIFICATIONS AS READ
  // ==========================================

  describe("PATCH /api/v1/notifications/read-all", () => {
    test("should mark all of the current user's unread notifications as read", async () => {
      await createTestNotification();
      await createTestNotification();
      await createTestNotification({
        isRead: true,
        readAt: new Date(),
      });

      const response = await request(app)
        .patch("/api/v1/notifications/read-all")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.modifiedCount).toBe(2);

      const unreadCount = await Notification.countDocuments({
        recipient: recipient._id,
        isRead: false,
      });

      expect(unreadCount).toBe(0);
    });

    test("should not modify another user's notifications", async () => {
      await createTestNotification({
        recipient: anotherUser._id,
      });

      const response = await request(app)
        .patch("/api/v1/notifications/read-all")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.modifiedCount).toBe(0);

      const otherUserNotification = await Notification.findOne({
        recipient: anotherUser._id,
      });

      expect(otherUserNotification.isRead).toBe(false);
    });

    test("should return zero when there are no unread notifications", async () => {
      const response = await request(app)
        .patch("/api/v1/notifications/read-all")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.modifiedCount).toBe(0);
    });

    test("should reject an unauthenticated request", async () => {
      const response = await request(app).patch(
        "/api/v1/notifications/read-all"
      );

      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================
  // 5. DELETE ONE NOTIFICATION
  // ==========================================

  describe("DELETE /api/v1/notifications/:id", () => {
    test("should delete the user's own notification", async () => {
      const notification = await createTestNotification();

      const response = await request(app)
        .delete(`/api/v1/notifications/${notification._id}`)
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedNotification = await Notification.findById(
        notification._id
      );

      expect(deletedNotification).toBeNull();
    });

    test("should prevent deleting another user's notification", async () => {
      const notification = await createTestNotification({
        recipient: anotherUser._id,
      });

      const response = await request(app)
        .delete(`/api/v1/notifications/${notification._id}`)
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(404);

      const existingNotification = await Notification.findById(
        notification._id
      );

      expect(existingNotification).not.toBeNull();
    });

    test("should reject an invalid notification ID", async () => {
      const response = await request(app)
        .delete("/api/v1/notifications/invalid-id")
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(400);
    });

    test("should return 404 for a nonexistent notification", async () => {
      const response = await request(app)
        .delete(
          "/api/v1/notifications/000000000000000000000000"
        )
        .set("Authorization", `Bearer ${recipientToken}`);

      expect(response.statusCode).toBe(404);
    });

    test("should reject an unauthenticated request", async () => {
      const notification = await createTestNotification();

      const response = await request(app).delete(
        `/api/v1/notifications/${notification._id}`
      );

      expect(response.statusCode).toBe(401);
    });
  });
});