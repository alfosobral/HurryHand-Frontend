import { splitE164, toE164 } from "./phone";
import { COUNTRIES } from "../constants/countryCodes";

export function userDtoToForm(user) {
  const { countryCode, phoneNumber } = splitE164(user?.phoneNumber || "", COUNTRIES);
  return {
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    birthdate: user?.birthdate || "",
    personalIdType: user?.personalIdType || "",
    personalId: user?.personalId || "",
    phoneNumber,
    countryCode,
    provider: !!user?.provider,

    credentialTitle: "",
    credentialImageUrl: "",
    credentialDescription: "",
    credentialIssuer: "",
    credentialDate: "",
    credentialExpiryDate: "",
  };
}

export function formPhoneToE164(form) {
  return toE164(form.countryCode, form.phoneNumber);
}
