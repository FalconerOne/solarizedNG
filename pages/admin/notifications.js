// pages/admin/notifications.js
"use client";
import React, { useState, useEffect } from "react";
import { Send, Loader2, History, Trash2 } from "lucide-react";

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState("broadcast");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 🧩 Fetch broadcast history
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

  // 🚀 Send broadcast
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return alert("Please enter both title and message");
    setSending(true);
    setResponse(null);

    try {
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
        setResponse({ ok: false, text: `❌ ${data.error || "Broadcast failed"}`
