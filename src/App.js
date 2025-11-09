import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute"; // lo usamos sólo en privadas
import Test from "./pages/Test"
import ServicePost from "./pages/ServicePost"
import Profile from "./pages/Profile"
import Calendar from "./pages/Calendar"
import ServicePostInfo from "./pages/ServicePostInfo";
import UserServicesHistoryPage from "./pages/UserServicesHistoryPage";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* pública */}
          <Route path="/" element={<Home />} />

          {/* públicas también */}
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/service-post/:id" element={<ServicePostInfo />} />

          {/* privadas: agrupadas bajo un guard con Outlet */}
          <Route element={<ProtectedRoute />}>
            {/*
            <Route path="/profile" element={<Profile />} />
            <Route path="/credential" element={<Credential />} />
            <Route path="/calendar" element={<Calendar />} />
            */}
          </Route>
          <Route path="/test" element={<Test />} />
          <Route path="/service-post" element={<ServicePost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/user-services-history" element={<UserServicesHistoryPage />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
    
  );
}
