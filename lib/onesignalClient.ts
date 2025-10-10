export async function sendPushAll(message: string) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    console.error("Missing OneSignal App ID");
    return;
  }

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY || ""}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["All"],
        contents: { en: message },
        name: "SolarizedNG Notification",
      }),
    });

    const result = await response.json();
    console.log("Push sent:", result);
  } catch (error) {
    console.error("Push error:", error);
  }
}
