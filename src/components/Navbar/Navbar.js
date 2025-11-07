import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaUserCircle, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.css";
import ChangeTheme from "../ChangeTheme/ChangeTheme";
import { deleteJwt } from "../../utils/tokens";
import { getLoggedUser } from "../../services/userService";

export default function Navbar({
  menuOff = false,
  prev = false,
  profileOff = false,
  searchbarOff = false,
  onSearch,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const navigate = useNavigate();

  const { isAuth, logout } = useAuth?.() ?? { isAuth: false, logout: () => {} };
  const [user, setUser] = useState(null);
  const logged = !!user || isAuth;

  // === Obtener usuario logueado ===
  useEffect(() => {
    let aborted = false;
    async function refreshUser() {
      try {
        const u = await getLoggedUser();
        if (aborted) return;
        setUser(u);
        setProfilePhoto(u?.profilePhoto ? `${u.profilePhoto}?t=${Date.now()}` : null);
      } catch {
        if (aborted) return;
        setUser(null);
        setProfilePhoto(null);
      }
    }
    refreshUser();

    const onStorage = (e) => {
      if (e.key === "token") refreshUser();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      aborted = true;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // === Logout ===
  const handleLogout = () => {
    try {
      logout?.();
    } catch {}
    deleteJwt();
    setUser(null);
    setProfilePhoto(null);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  return (
    <nav className={styles.navbar}>
      {/* === IZQUIERDA: Menu o Botón de Retroceso === */}
      <div className={styles.leftGroup}>
        {!menuOff && !prev && (
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={styles.menuButton}
            aria-label="Abrir menú"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}

        {prev && (
          <button
            onClick={() => navigate(-1)}
            className={styles.menuButton}
            aria-label="Volver atrás"
          >
            <FaArrowLeft />
          </button>
        )}
      </div>

      {/* === CENTRO: Searchbar (opcional) === */}
      {!searchbarOff && <SearchBar onSearch={onSearch} />}

      {/* === MENU LATERAL === */}
      {!menuOff && (
        <aside
          className={`${styles.panelBase} ${styles.leftPos} ${
            menuOpen ? styles.panelOpen : styles.panelClosed
          }`}
          aria-hidden={!menuOpen}
        >
          <a href="/" className={styles.sideLink} onClick={() => setMenuOpen(false)}>
            Categorías
          </a>
          <a
            href="/service-post"
            className={styles.sideLink}
            onClick={() => setMenuOpen(false)}
          >
            Servicios
          </a>
          <a
            href="/calendar"
            className={styles.sideLink}
            onClick={() => setMenuOpen(false)}
          >
            Mi calendario
          </a>
          <ChangeTheme />
        </aside>
      )}

      {/* === DERECHA: Perfil o botón de ingreso === */}
      <div className={styles.actions}>
        {!profileOff && (
          <>
            {logged ? (
              <>
                <div className={styles.profileWrap}>
                  <button
                    onClick={() => setDropdownOpen((open) => !open)}
                    className={styles.profileBtn}
                    aria-label="Abrir menú de perfil"
                  >
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Foto de perfil"
                        className={styles.profileImg}
                        onError={(e) => {
                          // si no se puede cargar la imagen, borramos la foto para que se vea el ícono
                          e.currentTarget.onerror = null;
                          setProfilePhoto(null);
                        }}
                      />
                    ) : (
                      <FaUserCircle className={styles.profileIcon} />
                    )}
                  </button>
                </div>

                <aside
                  className={`${styles.panelBase} ${styles.rightPos} ${
                    dropdownOpen ? styles.panelOpen : styles.panelClosed
                  }`}
                  aria-hidden={!dropdownOpen}
                >
                  <button
                    onClick={() => (window.location.href = "/profile")}
                    className={styles.sideLinkBtn}
                  >
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
          </>
        )}
      </div>
    </nav>
  );
}
