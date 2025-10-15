// pages/admin/notifications.js
import React, { useState, useEffect } from "react";
import { Send, Loader2, Trash2, RefreshCw } from "lucide-react";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [segment, setSegment] = useState("all");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // 🧩 Load broadcast history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    const res = await fetch("/api/admin/history");
    const data = await res.json();
    setHistory(data || []);
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 🚀 Broadcast sender
  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSending(true);
    setResponse(null);

    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, segment }),
    });

    const data = await res.json();
    if (res.ok) {
      setResponse({ ok: true, text: `✅ Sent to ${data.count} ${segment} users.` });
      setTitle("");
      setMessage("");
      fetchHistory();
    } else {
      setResponse({ ok: false, text: data.error || "Broadcast failed." });
    }

    setSending(false);
  };

  // 🗑️ Delete history item
  const deleteItem = async (id) => {
    if (!confirm("Delete this broadcast?")) return;
    await fetch(`/api/admin/history?id=${id}`, { method: "DELETE" });
    fetchHistory();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">📢 Admin Broadcasts</h1>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleBroadcast} className="space-y-4">
          {/* 🎯 Segment selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Send To</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="border p-2 rounded w-full dark:bg-gray-800"
            >
              <option value="all">All Users</option>
              <option value="activated">Activated Users</option>
              <option value="supervisors">Supervisors</option>
            </select>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Broadcast title"
            className="w-full border p-2 rounded dark:bg-gray-800"
            required
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            rows={4}
            className="w-full border p-2 rounded dark:bg-gray-800"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending..." : "Broadcast"}
          </button>
          {response && (
            <p className={`text-sm ${response.ok ? "text-green-600" : "text-red-500"}`}>
              {response.text}
            </p>
          )}
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">📜 Broadcast History</h2>
          <button
            onClick={fetchHistory}
            className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loadingHistory ? (
          <p className="text-gray-500">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-500">No broadcasts yet.</p>
