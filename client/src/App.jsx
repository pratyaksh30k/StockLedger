import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useAuth } from "./utils/AuthContext";
import Navbar from "./components/Navbar";
import Invoice from "./pages/Invoice";

const PrivateRoute = () => {
  const { user } = useAuth();
  const accessToken = localStorage.getItem("accessToken");

  if (!user && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const ProtectedLayout = () => {
  return (
    <>
      <Navbar />
      <div>
        <Outlet />
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<PrivateRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoice" element={<Invoice />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
