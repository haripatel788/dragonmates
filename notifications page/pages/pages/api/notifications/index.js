// pages/api/notifications/index.js
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  const notifications = [
    { id: "1", message: "New match found!", read: false },
    { id: "2", message: "Alex sent you a message.", read: true },
    { id: 
      "3", message: "Update your profile to get better matches.", read: false },
  ];

  res.status(200).json(notifications);
}
