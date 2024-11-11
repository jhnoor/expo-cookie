export const getBFFTokenFromCookie = (cookie: string | null) => {
  if (!cookie || cookie.length === 0) {
    return null;
  }

  return cookie
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c.includes("bff_token"))
    .map((c) => c.split("=")[1])[0];
};
