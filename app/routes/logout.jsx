import { redirect } from "@remix-run/node";
import { sessionStorage, USER_SESSION_KEY } from "../sessions.server.js";
import electron from "../electron.server.js";
import env from "../environment.server.js";

export const loader = async ({request}) => {
  if (env.electron) {
    electron.delete(USER_SESSION_KEY)
    throw redirect("/login");
  } else {
    const cookie = request.headers.get("Cookie");
    const session = await sessionStorage.getSession(cookie);
    session.unset(USER_SESSION_KEY);
    throw redirect("/login", {
        headers: { "Set-Cookie": await sessionStorage.commitSession(session, {
            maxAge: 60 * 60 * 24 * 30,
          }),
        },
      })
  }
}

export default function Logout() {
    return <></>;
}
