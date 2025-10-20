import { required, minLen, email, matchesField, password, strongPassword, onlyDigits, validAge, strongEnough, validPhone } from "./common";
import { compose, composeAsync } from "./compose";

export const loginValidators = {
  email: compose(required(), email()),
  password: compose(required()),
};

export const signUpValidators = {
  name: compose(required(), minLen(2)),
  surname: compose(required(), minLen(2)), 
  documentType: compose(required()),
  document: compose(required(), onlyDigits(), minLen(8)),
  email: compose(required(), email()),
  password: compose(required(), minLen(8), strongPassword(), strongEnough()),
  confirm: compose(required(), matchesField("password", "Las contraseñas no coinciden")),
  birthDate: compose(required(), validAge(18)),
  phoneNumber: compose(required(), validPhone()),
  accept: (v) => (v ? "" : "Debes aceptar los términos"),
};

// Ej: disponibilidad async de username (simulado con timeout)
const usernameAvailable = async (v) => {
  if (!v) return "Requerido";
  await new Promise((r) => setTimeout(r, 300)); // simulación
  const taken = ["admin", "root", "test"];
  return taken.includes(v.toLowerCase()) ? "Usuario no disponible" : "";
};
export const profileValidators = {
  username: composeAsync(usernameAvailable),
};
