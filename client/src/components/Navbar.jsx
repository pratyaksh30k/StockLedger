import { useEffect } from "react";
import API from "../utils/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    navigate("/login");
  }

  const getButtonClasses = (path) => {
    const baseClasses =
      "border border-black p-2 rounded-lg cursor-pointer transition-colors";
    return location.pathname === path
      ? `${baseClasses} bg-black text-white`
      : `${baseClasses} hover:bg-gray-200`;
  };

  return (
    <div className="w-full flex justify-between items-center border-b border-black p-4">
      {user && <p className="text-2xl font-bold">{user.companyName}</p>}
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className={getButtonClasses("/dashboard")}
        >
          Stock Manager
        </button>
        <button
          onClick={() => navigate("/invoice")}
          className={getButtonClasses("/invoice")}
        >
          Invoice Generator
        </button>
        <button
          onClick={logout}
          className="cursor-pointer border border-black p-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
