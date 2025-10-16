/**
 * utils/notify.ts
 * Handles server-side push notification delivery via OneSignal REST API.
 */

const ONE_SIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;
const ONE_SIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY!;

/**
 * Send a push notification using OneSignal REST API.
 *
 * @param title - Notification title
 * @param message - Notification body text
 * @param url - Optional URL to open when clicked
 * @param segment - (optional) Target group ("All", "Active Users", etc.)
 * @param playerIds - (optional) Array of specific OneSignal player IDs to send to
 */
export async function sendPushNotification({
  title,
  message,
  url,
  segment = "All",
  playerIds = [],
}: {
  title: string;
  message: string;
  url?: string;
  segment?: string;
  playerIds?: string[];
}) {
  try {
    const payload: any = {
      app_id: ONE_SIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      url: url || "https://mygiveaway.vercel.app",
    };

    // Broadcast to all users if no player IDs specified
    if (playerIds.length > 0) {
      payload.include_player_ids = playerIds;
    } else {
      payload.included_segments = [segment];
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${ONE_SIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ OneSignal Error:", err);
      throw new Error(`Failed to send notification: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Notification Sent:", data);
    return data;
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    throw error;
  }
}

/**
 * Quick test sender for local or admin-side usage
 * Example:
 * await testPush("System Update", "New giveaways added today!");
 */
export async function testPush(title: string, message: string) {
  return sendPushNotification({
    title,
    message,
    url: "https://mygiveaway.vercel.app/dashboard",
  });
}
