// src/components/Navbar.js
import { Link } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext"
import styles from "./Navbar.module.css";
import ChangeTheme from "../ChangeTheme/ChangeTheme";
import { deleteJwt } from "../../utils/tokens";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export default function Navbar({
  searchbarOff = false
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const { isAuth, logout } = useAuth?.() ?? { isAuth: false, logout: () => {} };

  // NEW: estado de login por token (fallback si aún no implementaste AuthContext)
  const [hasToken, setHasToken] = useState(!!getToken());
  const logged = isAuth || hasToken; // si hay token o el contexto dice que sí, consideramos logueado

  useEffect(() => {
    // refresca cuando cambie el storage (login/logout en otra pestaña)
    const onStorage = () => setHasToken(!!getToken());
    window.addEventListener("storage", onStorage);
    // chequeo inmediato por si el token entra después del primer render
    const t = setTimeout(() => setHasToken(!!getToken()), 0);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    // si no hay login, no buscamos foto
    if (!logged) {
      setProfilePhoto(null);
      return;
    }
    // podés dejar esto para el futuro: si falla o no viene foto, mostramos el ícono
    const fetchProfilePhoto = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const payload = JSON.parse(atob(token.split(".")[1] || ""));
        const email = payload?.sub || payload?.email;
        if (!email) return;
        const API = import.meta.env.REACT_APP_API_URL;
        const res = await fetch(`${API}/api/user/email/${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const user = await res.json();
        if (user?.profilePhoto) {
          setProfilePhoto(user.profilePhoto + "?t=" + Date.now());
        } else {
          setProfilePhoto(null); // <— fuerza ícono si no hay foto
        }
      } catch {
        setProfilePhoto(null); // <— ante cualquier error, ícono
      }
    };
    fetchProfilePhoto();
  }, [logged]);

  const handleLogout = () => {
    logout?.();
    deleteJwt();
    setHasToken(false);
    window.location.href = "/login";
  };


  return (
    <nav className={styles.navbar}>
      <div className={styles.leftGroup}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className={styles.menuButton}
          aria-label="Abrir menú"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {!searchbarOff && (
        <SearchBar onSearch={(q) => console.log("Buscar:", q)} />
      )}

        
      <aside
        className={`${styles.panelBase} ${styles.leftPos} ${menuOpen ? styles.panelOpen : styles.panelClosed}`}
        aria-hidden={!menuOpen}
      >
        <a href="/" className={styles.sideLink} onClick={() => setMenuOpen(false)}>
          Categorías
        </a>
        <a href="/service-post" className={styles.sideLink} onClick={() => setMenuOpen(false)}>
          Servicios
        </a>
        <a href="/contacto" className={styles.sideLink} onClick={() => setMenuOpen(false)}>
          Contacto
        </a>
        <a href="/calendar" className={styles.sideLink} onClick={() => setMenuOpen(false)}>
          Mi calendario
        </a>
        <ChangeTheme />
      </aside>

      <div className={styles.actions}>
        {logged ? (
          <>
            <div className={styles.profileWrap}>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className={styles.profileBtn}
                aria-label="Abrir menú de perfil"
              >
                {/* Si hay foto la mostramos; si no, el ícono queda visible */}
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Foto de perfil"
                    className={styles.profileImg}
                    onError={(e) => {
                      e.currentTarget.style.display = "none"; // fallback al ícono
                    }}
                  />
                ) : null}
                <FaUserCircle className={styles.profileIcon} />
              </button>
            </div>

            <aside
              className={`${styles.panelBase} ${styles.rightPos} ${
                dropdownOpen ? styles.panelOpen : styles.panelClosed
              }`}
              aria-hidden={!dropdownOpen}
            >
              <button onClick={() => (window.location.href = "/profile")} className={styles.sideLinkBtn}>
                Ir al perfil
              </button>
              <button onClick={handleLogout} className={styles.sideLinkBtn}>
                Cerrar sesión
              </button>
            </aside>
          </>
        ) : (
          <Link to="/login" className={styles.linkButton}>
            Ingresar
          </Link>
        )}
      </div>
    </nav>
  );
}

function handleSearch(q) {
  console.log("Buscar:", q);
}

