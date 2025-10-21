export function getJwt() {
  return (
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("jwt") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken")
  );
}

export function setJwt(token) {
    localStorage.setItem("jwt", token)
}

export function deleteJwt() {
    localStorage.removeItem("jwt");
    sessionStorage.removeItem("jwt");
}

export function getEmailFromJwt(token) {
  try {
    const payload = JSON.parse(atob(String(token).split(".")[1]));
    return payload.sub || payload.email || "";
  } catch {
    return "";
  }
}
