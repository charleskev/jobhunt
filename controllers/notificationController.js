/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { Notification, User, Application, Job } from "../models/index.js";
import { Op } from "sequelize";

// Get all notifications for user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { isRead, type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (isRead !== undefined) where.isRead = isRead === "true";
    if (type) where.type = type;

    const notifications = await Notification.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]]
    });

    res.json({
      success: true,
      data: notifications.rows,
      total: notifications.count,
      pages: Math.ceil(notifications.count / limit),
      unreadCount: await Notification.count({ where: { userId, isRead: false } })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single notification
export const getNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    if (notification.userId !== userId) return res.status(403).json({ success: false, message: "Unauthorized" });

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    if (notification.userId !== userId) return res.status(403).json({ success: false, message: "Unauthorized" });

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, message: "Notification marked as read", data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.session.userId;

    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    if (notification.userId !== userId) return res.status(403).json({ success: false, message: "Unauthorized" });

    await notification.destroy();

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete all notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.session.userId;

    await Notification.destroy({ where: { userId } });

    res.json({ success: true, message: "All notifications deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get notification preferences
export const getPreferences = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Preferences would be stored in user model or separate table
    const preferences = user.notificationPreferences || {};

    res.json({ success: true, data: preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update notification preferences
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update preferences (this would store in user model or separate table)
    user.notificationPreferences = req.body;
    await user.save();

    res.json({ success: true, message: "Preferences updated", data: user.notificationPreferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.session.userId;

    const count = await Notification.count({
      where: { userId, isRead: false }
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Batch operations
export const batchMarkAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.session.userId;

    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { id: notificationIds, userId } }
    );

    res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create notification (internal use)
export const createNotification = async (userId, type, title, message, relatedId, relatedType, metadata = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      metadata
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

export default {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getPreferences,
  updatePreferences,
  getUnreadCount,
  batchMarkAsRead,
  createNotification
};
