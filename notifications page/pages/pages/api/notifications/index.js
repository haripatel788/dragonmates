import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // from Doppler or .env
});

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    const { rows } = await pool.query(
      "SELECT id, message, read FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
      [userId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
}