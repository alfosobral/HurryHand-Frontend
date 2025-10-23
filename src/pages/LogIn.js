import { useState, useEffect } from "react";
import back1 from "../assets/Background1.png";
import back2 from "../assets/Background2.png";
import back3 from "../assets/Background3.png";
import back4 from "../assets/Background4.png";
import back5 from "../assets/Background5.png";
import back6 from "../assets/Background6.png";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card/Card";
import InputField from "../components/InputField/InputField";
import PasswordField from "../components/PasswordField/PasswordField";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import useForm from "../hooks/useForm";
import { loginValidators } from "../validators/user";
import { login } from "../services/authService";
import styles from "./styles/Form.module.css";
import ChangeTheme from "../components/ChangeTheme/ChangeTheme";
import { initialLogInForm } from "../utils/forms";

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const backgrounds = [back1, back2, back3, back4, back5, back6];
  const [idx, setIdx] = useState(0);

  const initial = initialLogInForm;  

  const {
    values, errors, touched,
    handleChange, handleBlur,
    validateAll, isValid
  } = useForm(initial, loginValidators, { validateOnChange: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (isSubmitting) return;
    if (!(await validateAll())) return;

    try {
      setIsSubmitting(true);
      await login({ email: values.email.trim(), password: values.password });
      navigate("/"); 
    } catch (err) {
      // mostrás mensaje del backend si viene
      const beMsg = err?.payload?.message || err?.message || "No se pudo iniciar sesión";
      setFormError(beMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    backgrounds.forEach(src => { const i = new Image(); i.src = src; });
  }, [backgrounds]);

  // { changed code } Slideshow cada 10s
  useEffect(() => {
    if (backgrounds.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % backgrounds.length), 10000);
    return () => clearInterval(t);
  }, [backgrounds.length]);

  return (
    <div className={styles.page}>
      <div className="bg-slideshow" aria-hidden="true">
        {backgrounds.map((src, i) => (
          <img key={i} src={src} alt="" className={`bg-slide ${i === idx ? "is-active" : ""}`} />
        ))}
        <div className="bg-vignette" />
      </div>
      <Card as="form" onSubmit={handleSubmit} noValidate className={styles.card}>
        <h2>Iniciar sesión</h2>

        {formError && (
          <p style={{ color: "#dc2626", fontSize: 13, marginTop: 6 }}>{formError}</p>
        )}

        <InputField
          id="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={handleChange("email")}
          onBlur={handleBlur("email")}
          error={errors.email}
          touched={touched.email}
          disabled={isSubmitting}
          autoComplete="email"
        />

        <PasswordField
          id="password"
          label="Contraseña"
          value={values.password}
          onChange={handleChange("password")}
          onBlur={handleBlur("password")}
          error={errors.password}
          touched={touched.password}
          disabled={isSubmitting}
          autoComplete="current-password"
        />

        <div style={{ margin: "18px 0 8px 0", textAlign: "center" }}>
          <span className={styles.text}>¿No tienes cuenta? </span>
          <a
          href="#"
          style={{ color: "#34aadcff", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}
          onClick={e => { e.preventDefault(); navigate("/signup"); }}
          >Registrarme</a>
          </div>

        <SubmitButton disabled={!isValid} loading={isSubmitting}>
          Entrar
        </SubmitButton>
      </Card>
      <ChangeTheme className={styles.themeFab} />
    </ div>
  );
}
