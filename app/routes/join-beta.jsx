import { Flex, Text, Button, Card, TextField, Heading, Strong, Callout, Link } from '@radix-ui/themes';
import { useSubmit, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import * as EmailValidator from 'email-validator';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { joinBeta } from "../wikid.server.js";
import { redirect, json } from "@remix-run/node";
import env from "../environment.server.js";

export const meta = () => {
    return [
        {
            title: "Wikid | join beta"
        },
        {
            property: "og:title",
            content: "Wikid | join beta",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export async function action({ request }) {
    const body = await request.formData();
    const email = body.get("email");

    const [_, errors] = await joinBeta({ input: { email: email } });

    if (!!errors) {
        console.error(errors);
        return json(errors);
    }

    throw redirect("/joined-beta", {});
}

export const loader = async () => {
    return json({electron: env.electron});
}

export default function JoinBeta() {

    const data = useLoaderData();
    const navigation = useNavigation();
    const actionData = useActionData();
    const submit = useSubmit();

    const [email, setEmail] = useState("");

    const [valid, setValid] = useState(false);

    const handleJoinBeta = useCallback(() => {
        if (!valid) {
            return;
        }
        const data = {
            email: email ?? "",
        };

        submit(data, { method: "post" });
    }, [email, valid]);

    useEffect(() => {
        setValid(EmailValidator.validate(email));
    }, [email]);

    return (
        <Flex direction="column" className="wk-main-content">
            {data.electron && <nav className='wk-heading'>
                <Text weight="bold">&nbsp;</Text>
            </nav>}
            <Flex direction="row" pt="9" align="start" justify="center" wrap="wrap" gap="9" className='wk-under-content'>
                <Card size="4">
                    <Flex direction="column" gap="2">
                        <Heading>Join the waiting list</Heading>
                        <Strong>
                            Want to be part of something awesome?
                        </Strong>
                        <Text size="2">
                            Register today to get early access.
                        </Text>
                        <Text size="2">You will gain unique flair awarded to your profile.</Text>
                        {!!actionData?.errors && <Callout.Root color='red'>
                            <Callout.Icon>
                                <InfoCircledIcon />
                            </Callout.Icon>
                            <Callout.Text>
                                {actionData.errors[0].message}
                            </Callout.Text>
                        </Callout.Root>}
                        <Flex direction="column" gap="0">
                            <Text weight="bold" size="2">Email</Text>
                        </Flex>
                        <TextField.Root>
                            <TextField.Input aria-label='Email address input' value={email} placeholder="" type='email' onKeyUp={(event) => {
                                if (event.key === "Enter" && navigation.state != "submitting") {
                                    handleJoinBeta();
                                }
                            }} onChange={(v) => {
                                setEmail(v.currentTarget.value.toLowerCase());
                            }} />
                        </TextField.Root>
                        <Button radius='full' aria-label='Join beta button' disabled={!valid || navigation.state == "submitting"} onClick={handleJoinBeta}>Join beta</Button>
                        <Text size="2" align="center">Already a member <Link href='/login' >Login</Link></Text>
                    </Flex>
                </Card>
            </Flex>
        </Flex>
    );
}
