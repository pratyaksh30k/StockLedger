import { createContext, useContext, useState, useEffect } from "react";
import API from "./axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      API.post("/auth/refresh", { refreshToken })
        .then((res) => {
          const { accessToken, refreshToken: newRefreshToken } = res.data;

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          setUser((prev) =>
            prev
              ? { ...prev, accessToken, refreshToken: newRefreshToken }
              : prev
          );
        })
        .catch((err) => {
          console.error("Refresh token error:", err);
          logout();
        });
    }
  }, []);

  const login = (data) => {
    const { accessToken, refreshToken, user } = data;

    const userData = {
      id: user.id,
      companyName: user.companyName,
      email: user.email,
      accessToken,
      refreshToken,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
