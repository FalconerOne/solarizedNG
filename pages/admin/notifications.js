// pages/admin/notifications.js
"use client";
import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";

const AdminNotifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState(null);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      alert("Please enter both title and message");
      return;
    }

    try {
      setSending(true);
      setResponse(null);

      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse({
          ok: true,
          text: `✅ Sent to ${data.count || 0} users successfully.`,
        });
        setTitle("");
        setMessage("");
      } else {
        setResponse({
          ok: false,
          text: `❌ Failed: ${data.error || "Unknown error"}`,
        });
      }
    } catch (err) {
      setResponse({ ok: false, text: `⚠️ Network error: ${err.message}` });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Admin Notifications
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Send broadcast messages to all users. Each notification will appear in
        their notification center instantly.
      </p>

      <form
        onSubmit={handleBroadcast}
        className="bg-white dark:bg-gray-900 shadow-sm rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-700"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
            placeholder="Enter broadcast title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
            placeholder="Write your broadcast message..."
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition disabled:opacity-60"
        >
          {sending ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Broadcast
            </>
          )}
        </button>

        {response && (
          <p
            className={`mt-3 text-sm ${
              response.ok ? "text-green-600" : "text-red-500"
            }`}
          >
            {response.text}
          </p>
        )}
      </f
