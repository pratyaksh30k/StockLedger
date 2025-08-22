import { useEffect, useState } from "react";
import API from "../utils/axios";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async () => {
    try {
      const res = await API.get("/user/dashboard");
      setUser(res.data.user);
    } catch (error) {
      console.log("Navbar fetch error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await API.post("/auth/logout", { refreshToken });
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.clear();
      navigate("/login");
    }
  };

  const getButtonClasses = (path) => {
    const baseClasses =
      "border border-black p-2 rounded-lg cursor-pointer transition-colors";
    return location.pathname === path
      ? `${baseClasses} bg-black text-white`
      : `${baseClasses} hover:bg-gray-200`;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="w-full flex justify-between items-center border-b border-black p-4">
      {user && <p className="text-2xl font-bold">{user.companyName}</p>}
      <div className="flex gap-4">
        <button onClick={() => navigate("/dashboard")} className={getButtonClasses("/dashboard")}>
          Stock Manager
        </button>
        <button onClick={() => navigate("/invoice")} className={getButtonClasses("/invoice")}>
          Invoice Generator
        </button>
        <button onClick={handleLogout} className="cursor-pointer border border-black p-2 rounded-lg">Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
