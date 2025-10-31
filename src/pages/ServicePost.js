import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../components/Card/Card";
import InputField from "../components/InputField/InputField";
import SelectField from "../components/SelectField/SelectField";
import CheckBox from "../components/CheckBox/CheckBox";
import DateField from "../components/DateField/DateField";
import TextAreaField from "../components/TextAreaField/TextAreaField";
import MultiSelectField from "../components/MultiSelectField/MultiSelectField";
import ProfileNavbar from "../components/ProfileNavbar/ProfileNavbar";

import { DURATION_OPTIONS, DAYS, initialServicePost } from "../constants/servicePostConstants";
import { URU_DEPARTMENTS } from "../constants/locations";
import { validateAll, validateStep1, validateStep2 } from "../validators/servicePostValidator";
import { buildDayOptions } from "../utils/timeSlots";
import { mapBackendErrorsToFields, toBackendPayload } from "../utils/servicePostMappers";

import { createServicePostMultipart, uploadServicePostPhoto } from "../services/servicePosts";
import styles from "./styles/ServicePost.module.css";

export default function ServicePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialServicePost);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0,1,2

  const errors = useMemo(() => validateAll(form), [form]);
  const getError = (name) => (touched[name] || submitted) ? (serverErrors[name] || errors[name]) : undefined;

  const canGoNext = (s) => {
    if (s === 0) return Object.keys(validateStep1(form)).length === 0;
    if (s === 1) return Object.keys(validateStep2(form)).length === 0;
    return true;
  };

  const dayOptions = useMemo(() => buildDayOptions(Number(form.xMinutes || 0)), [form.xMinutes]);

  const onBlur = (e) => {
    const key = e.target.name || e.target.id;
    if (!key) return;
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const onChange = (e) => {
    const { id, name, type, value, checked, files } = e.target;
    const key = name || id;
    if (!key) return;

    if (key === "portfolio") {
      setForm((f) => ({ ...f, portfolio: Array.from(files ?? []) }));
    } else if (type === "checkbox") {
      setForm((f) => ({ ...f, [key]: checked }));
    } else {
      setForm((f) => ({ ...f, [key]: value }));
    }

    if (serverErrors[key]) setServerErrors((se) => ({ ...se, [key]: undefined }));
    if (!touched[key]) setTouched((t) => ({ ...t, [key]: true }));
  };

  const onChangeDuration = (e) => {
    const v = Number(e.target.value || 0);
    setForm((f) => ({
      ...f,
      xMinutes: v,
      weeklySlots: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
    }));
    setTouched((t) => ({ ...t, xMinutes: true }));
    if (serverErrors.xMinutes) setServerErrors((se) => ({ ...se, xMinutes: undefined }));
  };

  const setDaySlots = (dayKey, values) => {
    setForm((f) => ({ ...f, weeklySlots: { ...f.weeklySlots, [dayKey]: values.map(String) } }));
  };

  const next = (e) => {
    e.preventDefault();
    const markTouchedStep0 = { title: true, description: true, xMinutes: true, rate: true, validUntil: true };
    const markTouchedStep1 = { weeklySlots: true };
    if (step === 0) setTouched((t) => ({ ...t, ...markTouchedStep0 }));
    if (step === 1) setTouched((t) => ({ ...t, ...markTouchedStep1 }));
    if (canGoNext(step)) setStep((s) => Math.min(2, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  async function uploadPortfolioFiles(files) {
    if (!Array.isArray(files) || files.length === 0) return [];
    const urls = [];
    for (const file of files) {
      try { const url = await uploadServicePostPhoto(file); if (url) urls.push(url); }
      catch (err) { console.error("Error subiendo imagen:", file?.name, err); }
    }
    return urls;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (step !== 2) return;
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      setTouched((t) => ({
        ...t,
        title: true, description: true, xMinutes: true, rate: true, validUntil: true,
        weeklySlots: true, department: true, city: true, street: true, doorNumber: true, postalCode: true,
      }));
      return;
    }

    setLoading(true);
    setServerErrors({});
    try {
      const payload = toBackendPayload(form);
        console.log("Payload enviado al backend:");
        console.log(JSON.stringify(payload, null, 2));

      await createServicePostMultipart(payload, form.portfolio);
      navigate("/");
    } catch (err) {
      const data = err?.data || err?.payload;
      const mapped = mapBackendErrorsToFields(data);
      if (Object.keys(mapped).length) {
        setServerErrors(mapped);
        setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(mapped).map((k) => [k, true])) }));
      } else {
        alert(data?.message || err.message || "Error al publicar servicio");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}><ProfileNavbar />
      <Card as="form" onSubmit={onSubmit} style={{ width: 720, maxWidth: "95vw" }}>
        <h1 className={styles.title}>Publicar servicio</h1>

        <div className={styles.steps}>
          {["Datos", "Disponibilidad", "Extras"].map((t, i) => (
            <div key={t} className={`${styles.step} ${i === step ? styles.stepActive : ""}`}>{t}</div>
          ))}
        </div>

        {/* Paso 0 */}
        {step === 0 && (
          <div>
            <InputField
              id="title" label="Título del servicio"
              value={form.title} onChange={onChange} onBlur={onBlur}
              placeholder="Ej: Instalación de luminarias"
              error={getError("title")} touched={touched.title || submitted}
            />

            <TextAreaField
              id="description" label="Descripción"
              value={form.description} onChange={onChange} onBlur={onBlur}
              placeholder="Alcance, materiales incluidos, etc."
              error={getError("description")} touched={touched.description || submitted}
            />

            <SelectField
              id="xMinutes" label="Tiempo estimado"
              value={String(form.xMinutes || "")} onChange={onChangeDuration} onBlur={onBlur}
              options={DURATION_OPTIONS}
              error={getError("xMinutes")} touched={touched.xMinutes || submitted}
            />

            <InputField
              id="rate" label="Tarifa base (UYU)"
              value={form.rate} onChange={onChange} onBlur={onBlur}
              inputMode="numeric" placeholder="Ej: 600"
              error={getError("rate")} touched={touched.rate || submitted}
            />

            <DateField
              id="validUntil" label="Válido hasta"
              value={form.validUntil} onChange={onChange} onBlur={onBlur}
              error={getError("validUntil")} touched={touched.validUntil || submitted}
            />
          </div>
        )}

        {/* Paso 1 */}
        {step === 1 && (
          <div>
            <label className={styles.label}>Disponibilidad por día</label>
            <div className={styles.weekGrid}>
              {DAYS.map(({ key, label }) => (
                <div key={key} className={styles.dayCol}>
                  <MultiSelectField
                    id={`dd-${key}`} label={label}
                    options={dayOptions}
                    values={(form.weeklySlots?.[key] || []).map(String)}
                    onChange={(vals) => setDaySlots(key, vals)}
                    placeholder={form.xMinutes ? "Elegir franjas" : "Primero elegí duración"}
                    error={undefined} touched={touched.weeklySlots || submitted}
                  />
                </div>
              ))}
            </div>
            {getError("weeklySlots") && (
              <p style={{ color: "#dc2626", fontSize: 13, marginTop: 6 }}>{getError("weeklySlots")}</p>
            )}
          </div>
        )}

        {/* Paso 2 */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <span>Fotos de trabajos (opcional)</span>
              <input type="file" id="portfolio" name="portfolio" multiple accept="image/*" onChange={onChange} />
            </div>

            <div style={{ marginTop: 14, marginBottom: 8 }}>
              La ubicación es <strong>opcional</strong>. Activá el switch si querés agregarla.
            </div>

            <CheckBox id="addLocation" label="Quiero agregar ubicación" checked={!!form.addLocation} onChange={onChange} />

            {form.addLocation && (
              <div style={{ marginTop: 10 }}>
                <SelectField
                  id="department" label="Departamento"
                  value={String(form.location.department || "")}
                  onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, department: e.target.value } }))}
                  onBlur={onBlur}
                  options={[{ value: "", label: "Seleccioná un departamento" }, ...URU_DEPARTMENTS]}
                  error={getError("department")} touched={touched.department || submitted}
                />

                <InputField
                  id="city" label="Ciudad"
                  value={form.location.city}
                  onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, city: e.target.value } }))}
                  onBlur={onBlur}
                  error={getError("city")} touched={touched.city || submitted}
                />

                <InputField
                  id="street" label="Calle"
                  value={form.location.street}
                  onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, street: e.target.value } }))}
                  onBlur={onBlur}
                  error={getError("street")} touched={touched.street || submitted}
                />

                <InputField
                  id="doorNumber" label="Número de puerta"
                  value={form.location.doorNumber}
                  onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, doorNumber: e.target.value } }))}
                  onBlur={onBlur}
                  inputMode="numeric"
                  error={getError("doorNumber")} touched={touched.doorNumber || submitted}
                />

                <InputField
                  id="postalCode" label="Código postal"
                  value={form.location.postalCode}
                  onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, postalCode: e.target.value } }))}
                  onBlur={onBlur}
                  inputMode="numeric"
                  error={getError("postalCode")} touched={touched.postalCode || submitted}
                />

                <InputField
                  id="apartment" label="Número de apartamento (opcional)"
                  value={form.location.apartment}
                  onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, apartment: e.target.value } }))}
                  onBlur={onBlur}
                />
              </div>
            )}
          </div>
        )}

        <div className={styles.footer}>
          {step > 0 && (
            <button type="button" className={styles.btnSecondary} onClick={back}>Atrás</button>
          )}
          {step < 2 ? (
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={!canGoNext(step)}
              onClick={next}
            >
              Siguiente
            </button>
          ) : (
            <button type="submit" className={styles.btnPrimary} disabled={loading || Object.keys(errors).length > 0}>
              {loading ? "Publicando..." : "Publicar servicio"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
