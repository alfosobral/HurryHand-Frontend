import Card from "../components/Card/Card";
import InputField from "../components/InputField/InputField";
import PasswordField from "../components/PasswordField/PasswordField";
import SelectField from "../components/SelectField/SelectField"
import PhoneField from "../components/PhoneField/PhoneField"
import PasswordStrengthBar from "../components/PasswordStrengthBar/PasswordStrengthBar";
import DateField from "../components/DateField/DateField";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import { useNavigate } from "react-router-dom";
import { signUp } from "../services/authService"
import logo from "../assets/Logo.png";
import useForm from "../hooks/useForm";
import { useState } from "react";
import { signUpValidators } from "../validators/user";
import { passwordStrength } from "../utils/password";
import { onlyDigitsMax, blockNonDigits, makeSanitizedChange, makeSanitizedPaste } from "../utils/inputs";
import styles from "./styles/Form.module.css";
import { toE164 } from "../utils/phone";
import ChangeTheme from "../components/ChangeTheme/ChangeTheme";
import { initialSignUpForm } from "../utils/forms";

export default function SignUp () {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const initial = initialSignUpForm;

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        isValid,
        setValues,
    } = useForm(initial, signUpValidators, {validateOnChange: true, dependencies: { password: ["confirm"] },});

    const strength = passwordStrength(values.password);
    const onlyDigits = (v) => v.replace(/\D+/g, "");
    const digits8Change = makeSanitizedChange(setValues, onlyDigitsMax(8));
    const digitsPaste  = makeSanitizedPaste(setValues, onlyDigits);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;         // evita doble submit
        const ok = await validateAll();
        if (!ok) return;

        try {
            setIsSubmitting(true);
            const payload = {
                email: values.email.trim(),
                password: values.password,
                name: values.name.trim(),
                surname: values.surname.trim(),
                phoneNumber: toE164(values.countryCode, values.phoneNumber),
                personalIdType: values.documentType === "Cedula Uruguaya" ? "DNI_URUGUAYO" : "OTRO",
                personalId: values.document,
                birthdate: values.birthDate,        
            };

        console.log("ENVIANDO A API:", payload)
        const res = await signUp(payload)
        console.log("OK", res);
        navigate("/login")

        } catch (err) {
            console.error("STATUS", err.status);
            console.error("PAYLOAD", err.payload);
            alert(err?.payload?.message || err?.message || "Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <Card as="form" onSubmit={handleSubmit} noValidate className={styles.card}>
                <img src={logo} alt="Error en la carga del logo" width={200} style={{ display: "block", margin: "0 auto"}} />
                <h1>¡Bienvenido! Crea tu cuenta aquí</h1>

                {/* Nombre */}
                <InputField
                    id="name"
                    label="Nombre"
                    value={values.name}
                    placeHolder="Escribe tu nombre"
                    onChange={handleChange("name")}
                    onBlur={handleBlur("name")}
                    error={errors.name}
                    touched={touched.name}
                />

                {/* Apellido */}
                <InputField
                    id="surname"
                    label="Apellido"
                    value={values.surname}
                    placeHolder="Escribe tu apellido"
                    onChange={handleChange("surname")}
                    onBlur={handleBlur("surname")}
                    error={errors.surname}
                    touched={touched.surname}
                />

                {/* Tipo de documento */}
                <SelectField
                    id="documentType"
                    label="Tipo de documento"
                    value={values.documentType}
                    onChange={handleChange("documentType")}
                    onBlur={handleBlur("documentType")}
                    options={[
                        {value:"Cedula Uruguaya", label:"Cédula Uruguaya"},
                        {value:"Pasaporte", label:"Pasaporte"},
                        {value:"Otro", label: "Otro"}
                    ]}
                    error={errors.documentType}
                    touched={touched.documentType}
                />

                {/* Documento */}
                <InputField
                    id="document"
                    label="Documento"
                    value={values.document}                // queda siempre solo dígitos en el estado
                    placeHolder="Escribe el número de documento"
                    onChange={digits8Change("document")}    // limpia tipeo/edición
                    onPaste={digitsPaste("document")}      // limpia pegado
                    onBlur={handleBlur("document")}
                    error={errors.document}
                    touched={touched.document}
                    inputMode="numeric"                    // teclado numérico en mobile
                    pattern="\d*"
                    onBeforeInput={blockNonDigits}         // bloquea letras al teclear
                />

                <DateField
                    id="birthDate"
                    label="Fecha de nacimiento"
                    value={values.birthDate}         // ISO YYYY-MM-DD
                    onChange={handleChange("birthDate")}
                    onBlur={handleBlur("birthDate")}
                    error={errors.birthDate}
                    touched={touched.birthDate}
                />

                {/* Telefono */}
                <PhoneField
                    id="phoneNumber"
                    label="Teléfono"
                    value={values.phoneNumber}
                    placeHolder="Escribe tu número de teléfono"
                    onChange={digits8Change("phoneNumber")}
                    onPaste={digitsPaste("phoneNumber")}
                    onBlur={handleBlur("phoneNumber")}
                    error={errors.phoneNumber}
                    touched={touched.phoneNumber}
                    selectedCountry={values.countryCode || "+598"}   // <<--
                    onCountryChange={(code) => setValues(s => ({ ...s, countryCode: code }))}  // <<--
                    inputMode="numeric"                    // teclado numérico en mobile
                    pattern="\d*"
                    onBeforeInput={blockNonDigits}         // bloquea letras al teclear
                />

                {/* Email */}
                <InputField
                    id="email"
                    label="Email"
                    value={values.email}
                    placeHolder="Escribe tu email"
                    onChange={handleChange("email")}
                    onBlur={handleBlur("email")}
                    error={errors.email}
                    touched={touched.email}
                />

                {/* Contrasenia */}
                <PasswordField
                    id="password"
                    label="Contraseña"
                    value={values.password}
                    placeHolder="Escribe una contraseña"
                    onChange={handleChange("password")}
                    onBlur={handleBlur("password")}
                    error={errors.password}
                    touched={touched.password}
                />

                <PasswordStrengthBar
                    score={strength.score}
                    label={strength.label}
                />

                {/* Confirmar */}
                <PasswordField
                    id="confirm"
                    label="Confirmar contraseña"
                    value={values.confirm}
                    placeHolder="Repite la contraseña"
                    onChange={handleChange("confirm")}
                    onBlur={handleBlur("confirm")}
                    error={errors.confirm}
                    touched={touched.confirm || !!values.confirm}
                />


                <label style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                    type="checkbox"
                    checked={values.accept}
                    onChange={(e) =>
                        setValues((s) => ({ ...s, accept: e.target.checked }))
                    }
                    onBlur={handleBlur("accept")}
                    />
                    <span>Acepto los términos y condiciones</span>
                </label>
                {touched.accept && errors.accept && (
                    <p style={{ color: "#dc2626", fontSize: 13 }}>{errors.accept}</p>
                )}

                <div style={{ margin: "18px 0 8px 0", textAlign: "center" }}>
                    <span className={styles.text}>¿Ya tienes cuenta? </span>
                    <a
                    href="#"
                    style={{ color: "#34aadcff", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}
                    onClick={e => { e.preventDefault(); navigate("/login"); }}
                    >Iniciar sesión</a>
                </div>

                <SubmitButton disabled={!isValid} loading={isSubmitting}>
                    Registrarme
                </SubmitButton>
            </Card>
            <ChangeTheme className={styles.themeFab} />
        </div>
    )
}