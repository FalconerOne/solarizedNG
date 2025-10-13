import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function sendNotification(e) {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      const response = await fetch(
        "https://yacftysswuumjbrfarmx.functions.supabase.co/send_notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, message, audience }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setFeedback(`✅ Sent to ${data.recipients} users`);
      } else {
        setFeedback(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setFeedback("⚠️ Something went wrong sending the notification.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Send Notifications</h1>
        <form onSubmit={sendNotification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Activation Reminder"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded"
              rows="4"
              placeholder="Join the giveaway before it closes!"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Users</option>
              <option value="activated">Activated Users</option>
              <option value="non_activated">Non-Activated Users</option>
              <option value="winners">Past Winners</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700"
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </form>

        {feedback && (
          <div className="mt-4 text-center font-medium text-gray-700">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}
