"use client";

import React, { useState } from "react";
import { sendBroadcastNotification } from "@/lib/sendBroadcastNotification";

export default function AdminBroadcastPanel() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleBroadcast() {
    if (!message.trim()) return;
    setSending(true);
    try {
      await sendBroadcastNotification(message, type as any);
      setFeedback("✅ Broadcast sent successfully!");
      setMessage("");
    } catch (err: any) {
      setFeedback("❌ Failed to send: " + err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-gray-200 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Admin Broadcast</h2>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message for all users..."
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-orange-200"
      />

      <div className="flex items-center justify-between">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm"
        >
          <option value="success">Success</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>

        <button
          disabled={sending}
          onClick={handleBroadcast}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
        >
          {sending ? "Sending..." : "Broadcast"}
        </button>
      </div>

      {feedback && (
        <p className="text-sm text-gray-600 mt-2 border-t pt-2">{feedback}</p>
      )}
    </div>
  );
}
