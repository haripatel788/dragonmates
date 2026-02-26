// pages/api/notifications/read.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { notificationId } = req.body;

  if (!notificationId) {
    return res.status(400).json({ message: "Missing notificationId" });
  }

  console.log(`Notification ${notificationId} marked as read`);

  res.status(200).json({ message: "Notification marked as read" });
}
