export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = import.meta.env.VITE_APP_LOGO || "/logo.gif";

export const getLoginUrl = (redirectTo?: string) => {
  const target =
    redirectTo ??
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : "");

  if (!target || target === "/login") {
    return "/login";
  }

  return `/login?redirect=${encodeURIComponent(target)}`;
};
