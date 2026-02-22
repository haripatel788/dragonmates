"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs"; // Clerk hook
import axios from "axios";

export default function NotificationsPage() {
  const { user, isSignedIn } = useUser(); // Get current signed-in user
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from your backend
  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchNotifications() {
      try {
        const response = await axios.get(`/api/notifications?userId=${user.id}`);
        setNotifications(response.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [isSignedIn, user]);

  // Mark notification as read (update state locally)
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    // Optional: also update backend
    axios.post(`/api/notifications/read`, { notificationId: id }).catch(console.error);
  };

  if (!isSignedIn) {
    return <p>Please sign in to view your notifications.</p>;
  }

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {notifications.length === 0 && <p>No notifications yet.</p>}

      <ul>
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`p-3 mb-2 border rounded-md ${
              notif.read ? "bg-gray-100" : "bg-blue-100 font-semibold"
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{notif.message}</span>
              {!notif.read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="ml-2 text-sm text-blue-700 underline"
                >
                  Mark as read
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
