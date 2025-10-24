
const TOKEN_KEY = "token"


export function getJwt() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY)
  );
}

export function setJwt(token) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function deleteJwt() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
}

export function getEmailFromJwt(token) {
  try {
    const payload = JSON.parse(atob(String(token).split(".")[1]));
    return payload.sub || payload.email || "";
  } catch {
    return "";
  }
}
