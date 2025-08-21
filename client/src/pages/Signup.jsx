import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Signup successful!");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        navigate("/dashboard");
      } else {
        setMessage(`${data.message || "Signup failed!"}`);
      }
    } catch (err) {
      console.log("Error", err);
      setMessage("Something went wrong!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col border border-black p-4 w-[30%] rounded-lg">
        <div className="text-2xl font-bold text-center mb-4">Signup</div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label
            className="font-semibold opacity-80 mb-1"
            htmlFor="companyName"
          >
            Company Name:
          </label>
          <input
            className="border border-black mb-2 p-1 rounded-lg"
            type="text"
            name="companyName"
            id="companyName"
            placeholder="Enter your company name"
            value={formData.companyName}
            onChange={handleChange}
          />
          <label className="font-semibold opacity-80 mb-1" htmlFor="email">
            Email:
          </label>
          <input
            className="border border-black mb-2 p-1 rounded-lg"
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          <label className="font-semibold opacity-80 mb-1" htmlFor="password">
            Password:
          </label>
          <input
            className="border border-black mb-2 p-1 rounded-lg"
            type="password"
            name="password"
            id="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="p-2 mt-2 text-white bg-black rounded-lg"
          >
            Signup
          </button>
          {message && (
            <p className="mt-3 text-center text-sm text-gray-700">{message}</p>
          )}
        </form>
        <p className="text-center text-sm m-2">
          Don't have an account?{" "}
          <Link className="underline text-blue-500" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
