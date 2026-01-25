import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [counts, setCounts] = useState({
    unreadChats: 0,
    friendRequests: 0
  });

  const fetchCounts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/notifications/counts",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setCounts(res.data);
    } catch {}
  };

  // poll every 5 seconds (simple & effective)
  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ counts, fetchCounts }}>
      {children}
    </NotificationContext.Provider>
  );
}
