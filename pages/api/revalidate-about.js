// pages/api/revalidate-about.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const secret = req.headers["x-revalidate-secret"];
  if (secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: "Invalid revalidation secret" });
  }

  try {
    // Trigger ISR revalidation for /about
    await res.revalidate("/about");
    console.log("✅ /about page revalidated successfully");
    return res.json({ revalidated: true });
  } catch (err) {
    console.error("Revalidation error:", err);
    return res.status(500).json({ message: "Error revalidating", error: err });
  }
}
