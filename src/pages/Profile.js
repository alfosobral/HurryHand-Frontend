import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../components/Card/Card";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import InputField from "../components/InputField/InputField";
import PasswordField from "../components/PasswordField/PasswordField";
import DateField from "../components/DateField/DateField";
import SelectField from "../components/SelectField/SelectField";
import PhoneField from "../components/PhoneField/PhoneField";
import TextAreaField from "../components/TextAreaField/TextAreaField";
import ProfileNavbar from "../components/ProfileNavbar/ProfileNavbar";
import ChangeTheme from "../components/ChangeTheme/ChangeTheme"

import styles from "./styles/Profile.module.css";
import { COUNTRIES } from "../constants/countryCodes";
import { initialProfileForm } from "../utils/forms";
import { PERSONAL_ID_TYPES } from "../constants/idTypes"
import { formPhoneToE164, userDtoToForm } from "../utils/profileMappers";
import { getEmailFromJwt, getJwt } from "../utils/tokens";
import {
  getMeByEmail, patchEmail, patchName, patchPassword, patchPhone, patchSurname,
  uploadProfilePhoto, listCredentials, createCredential, becomeProvider
} from "../services/profileService";
import { useScroll } from "framer-motion";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [original, setOriginal] = useState(null);               // snapshot para detectar cambios
  const [form, setForm] = useState(initialProfileForm);

  const [preview, setPreview] = useState(null);
  const [credentialImagePreview, setCredentialImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCredential, setSavingCredential] = useState(false);
  const [error, setError] = useState(null);

  const [credentials, setCredentials] = useState([]);
  const [loadingCredentials, setLoadingCredentials] = useState(true);

  const resolveRemoteUrl = (url) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
    if (!base) return url;
    return `${base}${url.startWith("/") ? "" : "/"}${url}`;
  }

  // Load user
  useEffect(() => {
    const token = getJwt();
    const email = getEmailFromJwt(token);
    if (!email) {
      setError("No se encontró el email en el token");
      setLoading(false);
      return;
    }

    getMeByEmail(email)
      .then((u) => {
        setUser(u);
        const f = userDtoToForm(u);
        setForm(f);
        setOriginal({
          name: u.name || "",
          surname: u.surname || "",
          email: u.email || "",
          phoneNumber: u.phoneNumber || "",
          provider: !!u.provider,
        });
        setLoading(false);
        if (u.provider) {
          listCredentials().then(setCredentials).catch(() => setCredentials([])).finally(() => setLoadingCredentials(false));
        } else {
          setLoadingCredentials(false);
        }
      })
      .catch((e) => {
        setError(e.message || "Error al cargar el usuario");
        setLoading(false);
      });
  }, []);

  // revoke previews
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => () => { if (credentialImagePreview) URL.revokeObjectURL(credentialImagePreview); }, [credentialImagePreview]);

  // Handlers básicos
  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const onInput = (id) => (e) => setField(id, e.target.value);

  // Imagen de perfil
  const onPickPhoto = () => document.getElementById("profile-upload")?.click();
  const onUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    setPreview(objUrl);
    try {
      const url = await uploadProfilePhoto(file);
      const cacheBusted = url ? `${url}?t=${Date.now()}` : "";
      setUser((prev) => ({ ...prev, profilePhoto: cacheBusted }));
    } catch (err) {
      alert("Error al subir imagen de perfil");
      setPreview(null);
    } finally {
      URL.revokeObjectURL(objUrl);
    }
  };

  // Provider switch
  const onProviderChange = async (nextVal) => {
    if (user?.provider || !nextVal) {
      setField("provider", nextVal);
      return;
    }
    const ok = window.confirm("¿Seguro que querés registrarte como proveedor?");

    if (!ok) return;
    try {
      await becomeProvider();
      setField("provider", true);
      setUser((u) => ({ ...u, provider: true }));
      setOriginal((o) => ({ ...o, provider: true }));
      setLoadingCredentials(true);
      const list = await listCredentials();
      setCredentials(list);
    } catch (e) {
      alert("Error al registrarse como proveedor: " + (e.message || e));
      setField("provider", false);
    } finally {
      setLoadingCredentials(false);
    }
  };

  // Guardado incremental (como en tu versión)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!original) return;

    const name = (form.name || "").trim();
    const surname = (form.surname || "").trim();
    const email = (form.email || "").trim();
    const currentPassword = form.currentPassword || "";
    const newPassword = form.newPassword || "";
    const phoneNumber = formPhoneToE164(form);
    const originalPhone = (original.phoneNumber || "").trim();

    const steps = [];
    if (name && name !== original.name) steps.push({ field: "name", run: () => patchName(name) });
    if (surname && surname !== original.surname) steps.push({ field: "surname", run: () => patchSurname(surname) });
    if (email && email !== original.email) steps.push({ field: "email", run: () => patchEmail(email) });

    if (newPassword) {
      if (!currentPassword) { alert("Ingresá tu contraseña actual"); return; }
      if (currentPassword === newPassword) { alert("La nueva contraseña debe ser distinta"); return; }
      if (newPassword.length < 6) { alert("La nueva contraseña debe tener al menos 6 caracteres"); return; }
      steps.push({ field: "password", run: () => patchPassword(currentPassword, newPassword) });
    }

    if (phoneNumber !== originalPhone) {
      steps.push({ field: "phoneNumber", run: () => patchPhone(phoneNumber) });
    }

    if (!steps.length) { alert("No hay cambios para guardar"); return; }

    setSaving(true);
    try {
      const ok = [], fail = [];
      for (const s of steps) {
        try { await s.run(); ok.push(s.field); }
        catch (e2) { fail.push({ field: s.field, error: e2?.message || String(e2) }); }
      }
      const applyOk = (field, doIt) => { if (ok.includes(field)) doIt(); };

        applyOk("name",       () => { setUser(u => ({ ...u, name }));       setOriginal(o => ({ ...o, name })); });
        applyOk("surname",    () => { setUser(u => ({ ...u, surname }));    setOriginal(o => ({ ...o, surname })); });
        applyOk("email",      () => { setUser(u => ({ ...u, email }));      setOriginal(o => ({ ...o, email })); });
        applyOk("password",   () => { setForm(f => ({ ...f, currentPassword: "", newPassword: "" })); });
        applyOk("phoneNumber",() => { setUser(u => ({ ...u, phoneNumber })); setOriginal(o => ({ ...o, phoneNumber })); });

      if (!fail.length) alert("Cambios guardados correctamente");
      else alert(`${ok.length} de ${steps.length} cambios guardados.\nFallaron:\n${fail.map(f => `• ${f.field}: ${f.error}`).join("\n")}`);
    } finally {
      setSaving(false);
    }
  };

  // Credenciales
  const onCredentialImagePick = () => document.getElementById("credential-image-upload")?.click();
  const onCredentialImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    setCredentialImagePreview(objUrl);
    try {
      // utiliza el mismo endpoint de subida que usas para perfil si corresponde
      const url = await uploadProfilePhoto(file);
      setField("credentialImageUrl", url);
      alert("Imagen subida");
    } catch {
      alert("Error al subir la imagen de credencial");
      setCredentialImagePreview(null);
    } finally {
      URL.revokeObjectURL(objUrl);
    }
  };


  const onAddCredential = async (e) => {
    e.preventDefault();
    if (!user?.provider) { alert("Debés ser proveedor para agregar credenciales"); return; }
    if (!form.credentialTitle || !form.credentialIssuer || !form.credentialDate) {
      alert("Completá: Título, Emisor y Fecha de emisión"); return;
    }
    setSavingCredential(true);
    try {
      const payload = {
        name: form.credentialTitle,
        issuer: form.credentialIssuer,
        description: form.credentialDescription || null,
        validUntil: form.credentialExpiryDate || null,
        issuedAt: form.credentialDate,
        startedAt: form.credentialDate,
        completedAt: form.credentialDate,
        certificateUrl: form.credentialImageUrl || null,
        credentialStatus: "VERIFIED",
      };
      await createCredential(payload);
      const list = await listCredentials();
      setCredentials(list);
      setForm((f) => ({
        ...f,
        credentialTitle: "", credentialImageUrl: "", credentialDescription: "",
        credentialIssuer: "", credentialDate: "", credentialExpiryDate: "",
      }));
      setCredentialImagePreview(null);
      alert("Credencial agregada");
    } catch (err) {
      alert("Error al agregar credencial: " + (err.message || err));
    } finally { setSavingCredential(false); }
  };

  if (loading) return <div style={{ color: "var(--text)", padding: 24 }}>Cargando…</div>;
  if (error) return <div style={{ color: "var(--text)", padding: 24 }}>Error: {error}</div>;
  if (!user) return <div style={{ color: "var(--text)", padding: 24 }}>No se encontró el usuario.</div>;

  return (
    <div className={styles.page}>
      <ProfileNavbar />

      <div className={styles.container}>
        {/* Perfil */}
        <Card style={{with: "60vw"}}>
          <div className={styles.sectionTitle}>Perfil del Usuario</div>

          <div className={styles.avatarBox}>
            {(preview || user?.profilePhoto) ? (
              <img
                src={preview || user.profilePhoto}
                alt="Foto de perfil"
                className={styles.avatarImg}
                onError={(e) => (e.currentTarget.src = "/default-credential.png")}
              />
            ) : null}

            <input id="profile-upload" type="file" accept="image/*" onChange={onUploadPhoto} style={{ display: "none" }} />
            <SubmitButton onClick={onPickPhoto} style={{ width: "auto" }}>
              {(preview || user?.profilePhoto) ? "Cambiar foto" : "Subir foto"}
            </SubmitButton>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.gridRow}>
              <InputField id="name" label="Nombre" value={form.name} onChange={onInput("name")} placeholder="Ingrese su nombre" />
              <InputField id="surname" label="Apellido" value={form.surname} onChange={onInput("surname")} placeholder="Ingrese su apellido" />
            </div>

            <div className={styles.gridRow}>
              <div className={styles.fullWidth}>
                <InputField id="email" label="Email" type="email" value={form.email} onChange={onInput("email")} disabled />
              </div>
            </div>

            <div className={styles.gridRow}>
              <div className={styles.fullWidth}>
                <PasswordField
                  id="currentPassword"
                  label="Contraseña Actual"
                  value={form.currentPassword}
                  onChange={onInput("currentPassword")}
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>
            </div>

            <div className={styles.gridRow}>
              <div className={styles.fullWidth}>
                <PasswordField
                  id="newPassword"
                  label="Nueva Contraseña"
                  value={form.newPassword}
                  onChange={onInput("newPassword")}
                  placeholder="Ingresa tu nueva contraseña"
                />
              </div>
            </div>

            <div className={styles.gridRow}>
              <DateField id="birthdate" label="Fecha de nacimiento" value={form.birthdate} onChange={onInput("birthdate")} disabled />
              <SelectField
                id="provider"
                label="¿Es proveedor de servicios?"
                value={String(user.provider ? true : form.provider)}
                onChange={(e) => onProviderChange(e.target.value === "true")}
                options={[{ value: "false", label: "No" }, { value: "true", label: "Sí" }]}
                disabled={user.provider}
              />
            </div>

            <div className={styles.gridRow}>
              <SelectField
                id="personalIdType"
                label="Tipo de ID"
                value={form.personalIdType}
                onChange={onInput("personalIdType")}
                options={PERSONAL_ID_TYPES}
                disabled
              />
              <InputField id="personalId" label="Número de ID" value={form.personalId} onChange={onInput("personalId")} disabled />
            </div>

            <div className={styles.gridRow}>
              <div className={styles.fullWidth}>
                <PhoneField
                  id="phoneNumber"
                  label="Teléfono"
                  value={form.phoneNumber}
                  selectedCountry={form.countryCode}
                  onChange={onInput("phoneNumber")}
                  onCountryChange={(cc) => setField("countryCode", cc)}
                  placeholder="Ingrese su teléfono"
                />
              </div>
            </div>

            <SubmitButton type="submit" style={{ marginTop: 20 }} disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </SubmitButton>
          </form>
        </Card>

        {/* Credenciales existentes */}
        {user?.provider && !loadingCredentials && credentials.length > 0 && (
          <Card>
            <div className={styles.sectionTitle}>Mis Credenciales</div>
            <div className={styles.credList}>
              {credentials.map((c) => (
                <div className={styles.credItem} key={c.id}>
                  <div className={styles.credThumb}>
                    {c.certificateUrl ? (
                      <img src={c.certificateUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : <span style={{ color: "var(--placeholder)", fontSize: 12 }}>Sin logo</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <h4 style={{ margin: 0, color: "var(--text)", fontSize: 16, fontWeight: 600 }}>{c.name}</h4>
                    <p style={{ margin: 0, color: "var(--text)" }}><strong>Emisor:</strong> {c.issuer}</p>
                    {c.description && <p style={{ margin: 0, color: "var(--text)" }}>{c.description}</p>}
                    <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "var(--text)" }}>
                      <span><strong>Emitida:</strong> {new Date(c.issuedAt).toLocaleDateString("es-ES")}</span>
                      {c.validUntil && <span><strong>Vence:</strong> {new Date(c.validUntil).toLocaleDateString("es-ES")}</span>}
                      <span className={`${styles.credBadge} ${c.credentialStatus === "VERIFIED" ? styles.badgeVerified : styles.badgePending}`}>
                        {c.credentialStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Alta de credenciales (provider) */}
        {user?.provider && (
          <Card>
            <div className={styles.sectionTitle}>Agregar Credencial</div>
            <form onSubmit={onAddCredential}>
              <div className={styles.gridRow}>
                <InputField
                  id="credentialTitle"
                  label="Título de credencial"
                  value={form.credentialTitle}
                  onChange={onInput("credentialTitle")}
                  placeholder="Ej: Electricista profesional"
                  required
                />
                <div className="full">
                  <label className="label">Imagen de credencial</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {credentialImagePreview && (
                      <img
                        src={credentialImagePreview}
                        alt="Preview credencial"
                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "2px solid var(--field-border)" }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <input id="credential-image-upload" type="file" accept="image/*" onChange={onCredentialImageUpload} style={{ display: "none" }} />
                      <SubmitButton type="button" onClick={() => document.getElementById("credential-image-upload")?.click()} style={{ width: "100%", padding: "10px" }}>
                        {credentialImagePreview ? "Cambiar imagen" : "Subir imagen"}
                      </SubmitButton>
                    </div>
                  </div>
                </div>
              </div>

              <TextAreaField
                id="credentialDescription"
                label="Descripción"
                value={form.credentialDescription}
                onChange={onInput("credentialDescription")}
                placeholder="Breve descripción de la credencial"
              />

              <InputField
                id="credentialIssuer"
                label="Emisor"
                value={form.credentialIssuer}
                onChange={onInput("credentialIssuer")}
                placeholder="Institución emisora"
                required
              />

              <div className={styles.gridRow}>
                <DateField id="credentialDate" label="Fecha de emisión" value={form.credentialDate} onChange={onInput("credentialDate")} required />
                <DateField id="credentialExpiryDate" label="Fecha de vencimiento" value={form.credentialExpiryDate} onChange={onInput("credentialExpiryDate")} />
              </div>

              <SubmitButton type="submit" style={{ marginTop: 20 }} disabled={savingCredential}>
                {savingCredential ? "Agregando..." : "Agregar Credencial"}
              </SubmitButton>
            </form>
          </Card>
        )}

        {/* Acceso rápido a servicios (provider) */}
        {user?.provider && (
          <Card>
            <div className={styles.sectionTitle}>Servicio profesional</div>
            <SubmitButton onClick={() => navigate("/service-post")}>Agregar Servicios</SubmitButton>
          </Card>
        )}
      </div>
    </div>
  );
}
