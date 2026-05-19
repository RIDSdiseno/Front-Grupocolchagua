export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const payloadBase64 = token.split(".")[1];

    if (!payloadBase64) return true;

    const payload = JSON.parse(atob(payloadBase64));
    const exp = payload.exp;

    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000);

    return exp <= now;
  } catch {
    return true;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};