export const getCookie = (name: string) => {
  const keyValues = document.cookie.split(";");
  let result = undefined;
  keyValues.forEach((item) => {
    const [key, value] = item.split("=");
    if (key.trim() === name) {
      result = value;
    }
  });
  return result;
};

export const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie =
    name + "=" + (value || "") + expires + "; Secure; SameSite=Strict; path=/";
};
