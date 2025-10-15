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
  }, [ac]()
