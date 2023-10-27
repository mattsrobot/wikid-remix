import { Flex, Text, Button, Card, TextField, Heading, Link, Callout, Box } from '@radix-ui/themes';
import { useSubmit, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import * as EmailValidator from 'email-validator';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { signIn } from "../wikid.server.js";
import { sessionStorage, USER_SESSION_KEY } from "../sessions.server.js";
import { redirect, json } from "@remix-run/node";
import electron from "../electron.server.js"
import env from "../environment.server.js";

import '../components/styles.login.css';

export const meta = () => {
    return [
        {
            title: "Wikid | login"
        },
        {
            property: "og:title",
            content: "Wikid | login",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export async function action({ request }) {

    const body = await request.formData();

    const input = JSON.parse(body.get("input"))

    const [response, errors] = await signIn({ input: input });

    if (!!errors) {
        console.error(errors);
        return json(errors);
    }

    if (!response.token) {
        console.error("No jwt token returned");
        return json([{ message: "Not allowed" }]);
    }

    if (env.electron) {
        electron.set(USER_SESSION_KEY, response.token);
        throw redirect("/c/get-started");
    } else {
        const cookie = request.headers.get("Cookie");
        const session = await sessionStorage.getSession(cookie);
        session.set(USER_SESSION_KEY, response.token);

        throw redirect("/c/get-started", {
            headers: {
                "Set-Cookie": await sessionStorage.commitSession(session, {
                    maxAge: 60 * 60 * 24 * 30,
                }),
            },
        });
    }
}

export const loader = async ({request}) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    return json({
        code: code,
        electron: env.electron,
     });
}

export default function Login() {

    const data = useLoaderData();
    const code = data.code;

    const navigation = useNavigation();
    const actionData = useActionData();
    const submit = useSubmit();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [valid, setValid] = useState(true);

    const handleLogin = useCallback(() => {
        if (!valid) {
            return;
        }

        const input = {
            email: email,
            password: password,
            code: code,
        }

        const data = {
            __action: "__login",
            input: JSON.stringify(input),
        };

        submit(data, { method: "post" });
    }, [email, password, valid, code]);

    useEffect(() => {
        setValid(EmailValidator.validate(email) && password.length >= 6);
    }, [email, password]);

    return (
        <Flex direction="column" className="wk-main-content">
            {data.electron && <nav className='wk-heading'>
                <Text weight="bold">&nbsp;</Text>
            </nav>}
            <Flex direction="row" pt="9" align="start" justify="center" wrap="wrap" gap="9" className='wk-under-content'>
                <Card size="4">
                    <Flex direction="column" gap="2">
                        <Heading>Login to Wikid</Heading>
                        <Box pt="2"></Box>
                        {!!actionData?.errors && <Callout.Root color='red'>
                            <Callout.Icon>
                                <InfoCircledIcon />
                            </Callout.Icon>
                            <Callout.Text>
                                {actionData?.errors[0].message}
                            </Callout.Text>
                        </Callout.Root>}
                        <Flex direction="column" gap="0">
                            <Text weight="bold" size="2">Email</Text>
                        </Flex>
                        <TextField.Root>
                            <TextField.Input value={email} placeholder="" type='email' onChange={(v) => {
                                setEmail(v.currentTarget.value.toLowerCase());
                            }} />
                        </TextField.Root>
                        <Flex direction="column" gap="0">
                            <Text weight="bold" size="2">Password</Text>
                        </Flex>
                        <TextField.Root>
                            <TextField.Input value={password} placeholder="" type='password' onKeyUp={(event) => {
                                if (event.key === "Enter" && navigation.state != "submitting") {
                                    handleLogin();
                                }
                            }} onChange={(v) => {
                                setPassword(v.currentTarget.value);
                            }} />
                        </TextField.Root>
                        <Button radius='full' mt="4" disabled={!valid || navigation.state == "submitting"} onClick={handleLogin}>Continue</Button>
                        <Text align="center" size="2">If you don't have an account <Link href="/signup">signup to Wikid</Link></Text>
                    </Flex>
                </Card>
            </Flex>
        </Flex>
    );
}
