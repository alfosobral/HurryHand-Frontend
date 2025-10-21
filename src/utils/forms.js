export const initialProfileForm = {
  name: "",
  surname: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  birthdate: "",
  personalIdType: "",
  personalId: "",
  phoneNumber: "",
  countryCode: "+598",
  provider: false,

  // Credenciales (para alta)
  credentialTitle: "",
  credentialImageUrl: "",
  credentialDescription: "",
  credentialIssuer: "",
  credentialDate: "",
  credentialExpiryDate: "",
};

export const initialSignUpForm = { 
    name: "", 
    surname: "",
    documentType:
    "Cedula Uruguaya", 
    document:"", 
    birthDate: "", 
    email: "", 
    password: "", 
    confirm: "", 
    phoneNumber: "", 
    countryCode: "", 
    accept: false 
};

export const initialLogInForm = { 
    email: "", 
    password: "" 
};