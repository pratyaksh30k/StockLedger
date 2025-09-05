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
import Navbar from "./components/Navbar";
import Invoice from "./pages/Invoice";

const PrivateRoute = () => {
  if (localStorage.getItem("accessToken") === null) {
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
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoice" element={<Invoice />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
