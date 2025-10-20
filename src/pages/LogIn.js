import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card/Card";
import InputField from "../components/InputField/InputField";
import PasswordField from "../components/PasswordField/PasswordField";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import useForm from "../hooks/useForm";
import { loginValidators } from "../validators/user";
import { login as loginService } from "../services/authService";

const initial = { email: "", password: "" };

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

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
      await loginService({ email: values.email.trim(), password: values.password });
      // OK → redirigí donde corresponda
      navigate("/"); // o "/"
    } catch (err) {
      // mostrás mensaje del backend si viene
      const beMsg = err?.payload?.message || err?.message || "No se pudo iniciar sesión";
      setFormError(beMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card as="form" onSubmit={handleSubmit} style={{ width: 420, margin: "40px auto" }}>
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
        <span style={{ color: "#ffffffff", fontSize: 15 }}>¿No tienes cuenta? </span>
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
  );
}
