import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./ProfileNavbar.module.css"
import logo from "../../assets/Logo.png";
import ChangeTheme from "../ChangeTheme/ChangeTheme";

export default function ProfileNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

   const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };
  

  return (
    <nav className={styles.navbar}>
      {/* Flecha para volver y logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: "100%" }}>
        <button onClick={handleBack} className={styles.backButton} aria-label="Volver al inicio">
          <FaArrowLeft />
        </button>
        <div className={styles.logo}>
          {/*
          <img 
            src={logo}
            alt="HurryHand Logo" 
            style={{ 
              height: "40px", 
              verticalAlign: "middle", 
              display: "block", 
              margin: "0 auto",
              filter: "drop-shadow(2px 2px 4px rgba(223, 222, 222, 0.6)) drop-shadow(-1px -1px 2px rgba(215, 210, 210, 0.2))",
              borderRadius: "10px"
            }} 
          />
          */}
        </div>
      </div>
    
      {/* Espacio vacío para mantener el layout */}
      <div style={{ flex: 1 }}></div>
      <ChangeTheme />
    </nav>
  );
}

