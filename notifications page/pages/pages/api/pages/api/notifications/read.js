// pages/api/notifications/read.js
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { notificationId } = req.body;
  if (!notificationId) {
    return res.status(400).json({ message: "Missing notificationId" });
  }

  try {
    await pool.query("UPDATE notifications SET read = TRUE WHERE id = $1", [
      notificationId,
    ]);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error marking notification as read" });
  }
}