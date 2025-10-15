// pages/admin/notifications.js
"use client";
import React, { useState, useEffect } from "react";
import { Send, Loader2, Trash2 } from "lucide-react";

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("broadcast");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/history");
      const data = await res.json();
      if (res.ok) setHistory(data);
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

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
        setResponse({ ok: true, text: `✅ Sent to ${data.count || 0} users.` });
        setTitle("");
        setMessage("");
        fetchHistory();
      } else {
        setResponse({
          ok: false,
          text: `❌ ${data.error || "Broadcast failed"}`,
        });
      }
    } catch (err) {
      setResponse({ ok: false, text: `⚠️ Network error: ${err.message}` });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this broadcast?")) return;
    try {
      const res = await fetch(`/api/admin/history?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Admin Notifications
      </h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            activeTab === "broadcast"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Broadcast
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            activeTab === "history"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          History
        </button>
      </div>

      {activeTab === "broadcast" ? (
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
        </form>
      ) : (
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          {loadingHistory ? (
            <div className="p-6 text-gray-500 flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" /> Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-gray-500 text-sm text-center">
              No broadcasts yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
