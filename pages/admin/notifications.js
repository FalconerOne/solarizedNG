// src/pages/admin/notifications.js
"use client";
import React, { useState, useEffect } from "react";
import { addNotification, getNotifications, markAsRead } from "@/lib/notifications";
import { useSession } from "@supabase/auth-helpers-react";

const AdminNotificationsPage = () => {
  const session = useSession();
  const user = session?.user;
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetId, setTargetId] = useState(""); // optional target user
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (user?.id) {
        const data = await getNotifications(user.id);
        setNotifications(data);
      }
    };
    load();
  }, [user?.id]);

  const handleSend = async () => {
    if (!title || !message) return alert("Please fill all fields");
    setLoading(true);

    try {
      if (targetId) {
        await addNotification({
          user_id: targetId,
          title,
          message,
          type: "admin",
        });
      } else {
        // 🔁 Broadcast to all users (handled via API route)
        const res = await fetch("/api/admin/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, message }),
        });
        if (!res.ok) throw new Error("Broadcast failed");
      }
      setTitle("");
      setMessage("");
      setTargetId("");
      alert("✅ Notification sent successfully!");
    } catch (e) {
      console.error(e);
      alert("❌ Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Notification Control Center
      </h1>

      {/* Send Notification Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">
          Send Notification
        </h2>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          />
          <textarea
