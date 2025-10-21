// Duraciones
export const DURATION_OPTIONS = [
  { value: "", label: "Seleccioná duración" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1 hora y media" },
  { value: "120", label: "2 horas" },
  { value: "150", label: "2 horas y media" },
  { value: "180", label: "3 horas" },
];

// Días (para UI)
export const DAYS = [
  { key: "mon", label: "Lunes" },
  { key: "tue", label: "Martes" },
  { key: "wed", label: "Miércoles" },
  { key: "thu", label: "Jueves" },
  { key: "fri", label: "Viernes" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

// Map para Date.getDay()
export const DAY_INDEX_TO_KEY = ["sun","mon","tue","wed","thu","fri","sat"];

// Estado inicial
export const initialServicePost = {
  title: "",
  description: "",
  xMinutes: 0,
  rate: "",
  validUntil: "", // yyyy-mm-dd
  weeklySlots: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
  portfolio: [],
  addLocation: false,
  location: { department: "", city: "", street: "", doorNumber: "", postalCode: "", apartment: "" },
};
