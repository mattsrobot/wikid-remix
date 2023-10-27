import { Flex, Card, Heading, Text, Button, TextField } from '@radix-ui/themes';
import { authorize } from "../sessions.server.js";
import { json, redirect } from "@remix-run/node";
import { joinCommunity, checkInvite } from "../wikid.server.js";
import { useLoaderData, useSubmit, Link } from "@remix-run/react";
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

import '../components/styles.get-started.css'
import { useCallback } from 'react';

export const meta = () => {
    return [
        {
            title: "Wikid | you've been invited"
        },
        {
            property: "og:title",
            content: "Wikid | you've been invited",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export const loader = async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    const jwt = await authorize(request);

    const [invite, errors] = await checkInvite(code, jwt);

    return json({ code: code, invite: invite, errors: errors });
}

export async function action({ request }) {
    const body = await request.formData();

    const jwt = await authorize(request);

    const type = body.get("__action");

    if (type == "accept_invite") {

        const code = body.get("code");

        if (!jwt) {
            throw redirect(`/signup?code=${code}`);
        }

        const [_, errors] = await joinCommunity(code, jwt);

        if (!!errors) {
            return json(errors);
        }

        throw redirect(`/c/${handle}`);
    }
}

export default function GetStarted() {

    const data = useLoaderData();
    const invite = data.invite;
    const code = data.code;
    const submit = useSubmit();

    const handleAcceptInvite = useCallback(() => {
        const data = {
            __action: "accept_invite",
            code: code,
        };
        submit(data, { method: "post" });
    }, [code]);

    const renderInvite = (invite) => {
        return <Flex direction="column" gap="4">
            <Heading>You've been invited!</Heading>
            <Text>To join <Text weight="bold">{invite.name}</Text>.</Text>
            <Flex gap="3">
                <Button radius='full' onClick={handleAcceptInvite}>Accept invite</Button>
            </Flex>
        </Flex>;
    }

    const renderErrors = () => {
        return <Flex direction="column" gap="4">
            <Heading>Whoops!</Heading>
            <Text>This invite has expired.</Text>
            <Link to="/c/get-started" className='rt-reset'>
                <Button radius='full' variant="soft">Return home</Button>
            </Link>
        </Flex>;
    }

    return (
        <Flex direction="column" gap="0" className="wk-main-content">
            <nav className='wk-heading-smol'>
                <Flex direction="row" align="center" justify="center" p="0" style={{ width: "100%" }}>
                    <TextField.Root radius='full'>
                        <TextField.Slot>
                            <MagnifyingGlassIcon height="16" width="16" />
                        </TextField.Slot>
                        <TextField.Input
                            type='text'
                            className='wk-find-community'
                            size="2"
                            defaultValue=""
                            placeholder="Find your community"
                            style={{ width: 400 }}
                        />
                    </TextField.Root>
                </Flex>
            </nav>
            <Flex direction="row" pt="8" align="start" justify="center" wrap="wrap" gap="9" className='wk-under-content'>
                <Card style={{ maxWidth: 400, width: "100%" }} size="4">
                    {!!invite ? renderInvite(invite) : renderErrors()}
                </Card>
            </Flex>
        </Flex>
    );
}
