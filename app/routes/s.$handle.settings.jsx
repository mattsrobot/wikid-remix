import { redirect, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { community, me } from "../wikid.server.js";
import { authorize, sessionStorage } from "../sessions.server.js";
import CommunitySettingsMenu from "../components/community-settings-menu.jsx";
import UserMenu from "../components/user-menu.jsx";
import * as Toast from '@radix-ui/react-toast';
import { useState, useRef, useEffect } from 'react'
import { useLoaderData } from "@remix-run/react";

export const shouldRevalidate = () => {
    return true;
};

export const loader = async ({ request, params }) => {
    const jwt = await authorize(request);

    if (!jwt) {
        return redirect('/c/get-started');
    }

    const cookie = request.headers.get("Cookie");
    const session = await sessionStorage.getSession(cookie);
    const message = session.get("message");

    const handle = params.handle;

    let mr;
    let cr;

    const v = await Promise.all([
        community(handle, jwt),
        me(jwt)
    ]);

    const [r1] = v[0];

    cr = r1;

    if (cr?.permissions?.manage_community != true) {
        return redirect('/login');
    }

    const [r2, errors] = v[1];

    if (!!errors) {
        return redirect('/login');
    }

    mr = r2;

    return json({
        path: request.url,
        message: message,
        me: mr,
        community: cr,
    }, {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session, {
                maxAge: 60 * 60 * 24 * 30,
            }),
        },
    });
}

export default function CommunityNavigation() {

    const data = useLoaderData();
    const message = data.message;
    const timerRef = useRef(0);
    const [toastOpen, setToastOpen] = useState(false);
    const [toast, setToast] = useState("");

    useEffect(() => {
        if (!message || message.length == 0) {
            return;
        }

        setToast(message);
        setToastOpen(true);

        timerRef.current = window.setTimeout(() => {
            setToastOpen(false);
            setToast("");
        }, 700);

    }, [data, message]);

    return (
        <div className='wk-community'>
            <UserMenu />
            <CommunitySettingsMenu />
            <Outlet />
            <Toast.Root className="wk-toast-root" open={toastOpen} onOpenChange={(o) => setToastOpen(o)} data-variant="success">
                <Toast.Description>
                    {toast}
                </Toast.Description>
            </Toast.Root>
            <Toast.Viewport className="wk-toast-viewport" />
        </div>
    );
}
