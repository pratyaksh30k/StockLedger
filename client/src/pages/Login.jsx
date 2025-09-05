import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axios";
import { useAuth } from "../utils/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || "Login failed");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col border border-black p-4 w-full lg:w-[40%] rounded-lg">
        <div className="text-2xl font-bold text-center mb-4">Login</div>
        <form className="flex flex-col" onSubmit={handleLogin}>
          <label className="font-semibold opacity-80 mb-1" htmlFor="email">
            Email:
          </label>
          <input
            className="border border-black mb-2 p-1 rounded-lg"
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="font-semibold opacity-80 mb-1" htmlFor="password">
            Password:
          </label>
          <input
            className="border border-black mb-2 p-1 rounded-lg"
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="p-2 mt-2 text-white bg-black rounded-lg"
          >
            Login
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <p className="text-center text-sm m-2">
          Don't have an account?{" "}
          <Link className="underline text-blue-500" to="/signup">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
