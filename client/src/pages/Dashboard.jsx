import React from "react";
import { useEffect } from "react";

const Dashboard = () => {
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch("http://localhost:5000/api/auth/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        const refreshRes = await fetch(
          "http://localhost:5000/api/auth/refresh",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              refreshToken: localStorage.getItem("refreshToken"),
            }),
          }
        );

        const data = await refreshRes.json();
        if (refreshRes.ok) {
          localStorage.setItem("accessToken", data.accessToken);
          return fetchDashboard();
        } else {
          throw new Error("Session expired. Please login again.");
        }
      }

      return await console.log(res.json());
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    }
  };
  useEffect(() => {
    fetchDashboard();
  }, []);

  return <div>Dashboard</div>;
};

export default Dashboard;
