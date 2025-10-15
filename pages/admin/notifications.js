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

  async function fetchHistory() {
    try {
      setLoadingHistory(true);
      const res = await fetch("/api/admin/history");
      const data = await res.json();
      if (res.ok) setHistory(data);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  async function handleBroadcast(e) {
    e.preventDefault();
    if (!title || !message) return alert("Enter both title and message");
    setSending(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse({ ok: true, text: `✅ Sent to ${data.count || 0} users` });
        setTitle("");
        setMessage("");
        fetchHistory();
      } else {
        setResponse({ ok: false, text: `❌ ${data.error || "Broadcast failed"}` });
      }
    } catch (err) {
      setResponse({ ok: false, text: "⚠️ Network error" });
    }
    setSending(false);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this broadcast?")) return;
    const res = await fetch(`/api/admin/history?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setHistory((prev) => prev.filter((h) => h.id !== id));
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Admin Notifications</h1>

      <div className="flex gap-3 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-4 py-2 border-b-2 ${
            activeTab === "broadcast"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500"
          }`}
        >
          Broadcast
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 border-b-2 ${
            activeTab === "history"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500"
          }`}
        >
          History
        </button>
      </div>

      {activeTab === "broadcast" ? (
        <form onSubmit={handleBroadcast} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Broadcast title"
            className="w-full border p-2 rounded"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            rows={4}
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded"
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
      ) : (
        <div>
          {loadingHistory ? (
            <p>Loading...</p>
          ) : history.length === 0 ? (
            <p>No broadcasts yet.</p>
          ) : (
            <ul className="divide-y">
              {history.map((item) => (
                <li key={item.id} className="flex justify-between py-2">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <small>{new Date(item.created_at).toLocaleString()}</small>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
