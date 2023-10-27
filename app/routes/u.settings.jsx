import { Flex, Text, TextArea, TextField, Tabs, Box, Button, Link, Checkbox, Select, Avatar, IconButton } from '@radix-ui/themes';
import { sessionStorage, THEME_SESSION_KEY } from "../sessions.server.js";
import { redirect, json } from "@remix-run/node";
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLoaderData, useSubmit, useNavigation, useActionData, useFetcher } from "@remix-run/react";
import { updateProfile, me, UNEXPECTED_ERROR_MESSAGE } from "../wikid.server.js";
import * as Toast from '@radix-ui/react-toast';
import electron from "../electron.server.js";
import env from "../environment.server.js";
import { authorize } from "../sessions.server.js";
import { friendlyName, avatarFallback } from "../components/helpers.js";

export const meta = () => {
    return [
        {
            title: "Wikid | settings"
        },
        {
            property: "og:title",
            content: "Wikid | settings",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export const loader = async ({ request }) => {

    const jwt = await authorize(request);

    if (!jwt) {
        throw redirect('/login');
    }

    let theme = null;

    if (env.electron) {
        theme = electron.get(THEME_SESSION_KEY);
    } else {
        const cookie = request.headers.get("Cookie");
        const session = await sessionStorage.getSession(cookie);
        theme = session.get(THEME_SESSION_KEY);
    }

    const [data, errors] = await me(jwt);

    if (!!errors) {
        throw redirect('/login');
    }

    return json({
        theme: theme ?? "dark",
        me: data,
    })
}

export async function action({ request }) {
    const body = await request.formData();

    const jwt = await authorize(request);

    const action = body.get("__action");

    if (action == "change_theme") {

        const theme = body.get("theme");

        if (env.electron) {
            electron.set(THEME_SESSION_KEY, theme);

            throw redirect("/u/settings");
        } else {
            const cookie = request.headers.get("Cookie");
            const session = await sessionStorage.getSession(cookie);
            session.set(THEME_SESSION_KEY, theme);

            throw redirect("/u/settings", {
                headers: {
                    "Set-Cookie": await sessionStorage.commitSession(session, {
                        maxAge: 60 * 60 * 24 * 30,
                    }),
                },
            });
        }
    } else if (action == "update_profile") {

        const name = body.get("name");
        const handle = body.get("handle");
        const about = body.get("about");

        const [r, errors] = await updateProfile(name, handle, about, jwt);

        if (!!r?.handle) {
            return json({ profileUpdated: true });
        } else if (!!errors) {
            return json({ errors: errors });
        } else {
            return json({ errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] });
        }
    }

    return json({});
}

export default function UserSettings() {

    const avatarFetcher = useFetcher({key: "avatar"});
    const data = useLoaderData();
    const navigation = useNavigation();
    const submit = useSubmit();
    const actionData = useActionData();
    const timerRef = useRef(0);

    const hiddenFileInput = useRef(null);

    useEffect(() => {
        if (!!avatarFetcher.data?.updated) {
            location.reload();
        }
    }, [avatarFetcher]);

    const fb = avatarFallback(friendlyName(data.me.name, data.me.handle));

    const handleProfilePicClick = useCallback(() => {
        hiddenFileInput.current.click();
    }, []);

    const handleProfilePicChange = useCallback(async (event) => {
        const fileUpload = event.target.files[0];
        const form = new FormData();
        form.append("__action", "update_profile_pic");
        form.append('file', fileUpload);
        avatarFetcher.submit(form, {
            method: "post",
            action: "/z/create-message",
            encType: "multipart/form-data"
        })
    }, [data]);

    const [name, setName] = useState(data.me.name);
    const [handle, setHandle] = useState(data.me.handle);
    const [about, setAbout] = useState(data.me.about);

    const [toastOpen, setToastOpen] = useState(false);
    const [toast, setToast] = useState("");

    const [understood, setUnderstood] = useState(false);

    const toggleUnderstood = useCallback(() => {
        setUnderstood(v => !v);
    }, []);

    const handleProfileChange = useCallback(() => {
        window.clearTimeout(timerRef.current);

        const data = {
            __action: "update_profile",
            name: name,
            handle: handle,
            about: about,
        };

        submit(data, { method: "post" });
    }, [name, handle, about]);

    const handleThemeChange = useCallback((theme) => {
        const data = {
            __action: "change_theme",
            theme: theme,
        };

        submit(data, { method: "post" });
    }, []);

    useEffect(() => {
        if (actionData?.profileUpdated == true) {
            setToast("Saved");
            setToastOpen(true);
            timerRef.current = window.setTimeout(() => {
                setToastOpen(false);
            }, 700);
        }
    }, [actionData]);

    return (
        <>
            <Toast.Root className="wk-toast-root" open={toastOpen} onOpenChange={setToastOpen} data-variant="success">
                <Toast.Description>
                    {toast}
                </Toast.Description>
            </Toast.Root>
            <Toast.Viewport className="wk-toast-viewport" />
            <Flex direction="column" gap="0" className="wk-main-content">
                <nav className='wk-heading'>
                    <Text weight="bold">User Preferences</Text>
                </nav>
                <Box pl="4" pr="4" pt="4" style={{ height: "100vh" }}>
                    <Tabs.Root defaultValue="account">
                        <Tabs.List>
                            <Tabs.Trigger value="account">Profile</Tabs.Trigger>
                            <Tabs.Trigger value="appearance">Appearance</Tabs.Trigger>
                            {/* <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger> */}
                            <Tabs.Trigger value="logout">Logout</Tabs.Trigger>
                            <Tabs.Trigger value="delete">Delete account</Tabs.Trigger>
                        </Tabs.List>
                        <Box pl="4" pr="4" pt="3" pb="2">
                            <Tabs.Content value="account">
                                <Flex direction="column" gap="3" style={{ maxWidth: 400 }}>
                                    <Text size="2">Make changes to your profile.</Text>
                                    <Flex direction="column" gap="1">
                                        <Text as="div" size="2" mb="1" weight="bold">
                                            Profile picture
                                        </Text>
                                        <Flex align="center" direction="row" gap="3">
                                            <IconButton aria-label="Change avatar" variant='ghost' onClick={handleProfilePicClick} radius='full' color='gray'>
                                                <Avatar
                                                    src={data.me.avatar_url}
                                                    size="6"
                                                    fallback={fb}
                                                    radius='full' />
                                            </IconButton>
                                            <Box>
                                                <Button radius='full' size="1" onClick={handleProfilePicClick}>
                                                    Change avatar
                                                </Button>
                                            </Box>
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg"
                                                onChange={handleProfilePicChange}
                                                ref={hiddenFileInput}
                                                style={{ display: "none" }}
                                            />
                                        </Flex>
                                    </Flex>
                                    <label>
                                        <Text as="div" size="2" mb="1" weight="bold">
                                            Name
                                        </Text>
                                        <TextField.Input
                                            type='text'
                                            value={name}
                                            onChange={(v) => {
                                                setName(v.currentTarget.value);
                                            }}
                                            placeholder="Your name"
                                        />
                                    </label>
                                    <label>
                                        <Text as="div" size="2" mb="1" weight="bold">
                                            Unique handle
                                        </Text>
                                        <TextField.Input
                                            type='text'
                                            value={handle}
                                            onChange={(v) => {
                                                setHandle(v.currentTarget.value);
                                            }}
                                            placeholder="Your unique handle"
                                        />
                                    </label>
                                    <label>
                                        <Text as="div" size="2" mb="1" weight="bold">
                                            About you
                                        </Text>
                                        <Text as="div" color="gray" size="2" mb="2">
                                            Your community will be visible on the web, you choose what to share.
                                        </Text>
                                        <TextArea
                                            size="2"
                                            variant="surface"
                                            value={about}
                                            onChange={(v) => {
                                                setAbout(v.currentTarget.value);
                                            }}
                                            placeholder="About you" />
                                    </label>
                                    <label>
                                        <Button mt="2" size="1" radius='full' onClick={handleProfileChange} disabled={navigation.state == "submitting"}>Save changes</Button>
                                    </label>
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="appearance">
                                <Flex direction="column" gap="3" style={{ maxWidth: 400 }}>
                                    <Text size="2">Configure your app appearance.</Text>
                                    <div>
                                        <Select.Root defaultValue={data.theme} onValueChange={handleThemeChange} disabled={navigation.state == "submitting"}>
                                            <Select.Trigger radius="full" />
                                            <Select.Content>
                                                <Select.Group>
                                                    <Select.Item value="dark">Dark</Select.Item>
                                                    <Select.Item value="light">Light</Select.Item>
                                                </Select.Group>
                                            </Select.Content>
                                        </Select.Root>
                                    </div>
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="notifications">
                                <Flex direction="column" gap="3" style={{ maxWidth: 400 }}>
                                    <Text size="2">Update your notifiction settings here.</Text>
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="logout">
                                <Flex direction="column" gap="3" style={{ maxWidth: 400 }}>
                                    <Text size="2">Logout of Wikid.</Text>
                                    <Link href="/logout">
                                        <Button size="1" radius='full' color='red'>Logout</Button>
                                    </Link>
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="delete">
                                <Flex direction="column" gap="3" style={{ maxWidth: 400 }}>
                                    <Text size="2">Delete your Wikid account.</Text>
                                    <Text size="2">This is a permanent action, your account will not be recoverable.</Text>
                                    <Text size="2" color='red'>You won't be able to create a new account with the email address registered to this account.</Text>
                                    <Text as="label" size="2">
                                        <Flex gap="2">
                                            <Checkbox aria-label='I understand' checked={understood} onCheckedChange={toggleUnderstood} /> I understand
                                        </Flex>
                                    </Text>
                                    <Link href="/logout">
                                        <Button size="1" radius='full' disabled={!understood} color='red'>Delete account</Button>
                                    </Link>
                                </Flex>
                            </Tabs.Content>
                        </Box>
                    </Tabs.Root>
                </Box>
            </Flex>
        </>
    );
}
