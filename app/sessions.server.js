import { createCookieSessionStorage } from "@remix-run/node";
import electron from "./electron.server.js";
import env from "./environment.server.js";

export const USER_SESSION_KEY = "jwt";
export const THEME_SESSION_KEY = "theme";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secrets: ["8041c9f3768f7bb2e39eab09f9d6b9e12cc6a4dfbaaa117b0890ca8e5179262ec84d75921851fef3efa948"],
    secure: process.env.NODE_ENV === "production",
  },
});

export const authorize = async (request) => {
  let jwt = null;

  if (env.electron) {
    jwt = electron.get(USER_SESSION_KEY);
  } else {
    const cookie = request.headers.get("Cookie");
    const session = await sessionStorage.getSession(cookie);
    jwt = session.get(USER_SESSION_KEY);
  }

  return jwt;
}

export const themePreference = async (request) => {
  let theme = null;

  if (env.electron) {
    theme = electron.get(THEME_SESSION_KEY);
  } else {
    const cookie = request.headers.get("Cookie");
    const session = await sessionStorage.getSession(cookie);
    theme = session.get(THEME_SESSION_KEY);
  }

  return theme ?? "dark";
}
