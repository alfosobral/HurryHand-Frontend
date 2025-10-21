import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute"; // lo usamos sólo en privadas


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* pública */}
          <Route path="/" element={<Home />} />

          {/* públicas también */}
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* privadas: agrupadas bajo un guard con Outlet */}
          <Route element={<ProtectedRoute />}>
            {/*
            <Route path="/profile" element={<Profile />} />
            <Route path="/credential" element={<Credential />} />
            <Route path="/calendar" element={<Calendar />} />
            */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
