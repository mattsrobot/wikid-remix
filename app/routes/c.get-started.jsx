import { Flex, Card, Heading, Text, Button, Dialog, TextField, Strong, Link } from '@radix-ui/themes';
import { authorize } from "../sessions.server.js";
import { json, redirect } from "@remix-run/node";
import CreateCommunityDialog from '../components/create-community-dialog.jsx';
import { me, createCommunity } from "../wikid.server.js";
import { useLoaderData } from "@remix-run/react";
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

import '../components/styles.get-started.css'

export const meta = () => {
    return [
        {
            title: "Wikid | join a community"
        },
        {
            property: "og:title",
            content: "Wikid | join a community",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export const loader = async ({ request }) => {
    const jwt = await authorize(request);

    if (!!jwt) {
        const [data, errors] = await me(jwt);
        return json({ me: data, errors: errors });
    }

    return json({ me: null, errors: null })
}

export async function action({ request }) {
    const body = await request.formData();

    const jwt = await authorize(request);

    const type = body.get("__action");

    if (type == "create_community") {

        const name = body.get("name");
        const handle = body.get("handle");
        const _private = body.get("private") == "private";

        const [_, errors, __] = await createCommunity(name, handle, _private, jwt);

        if (!!errors) {
            return json(errors);
        }

        throw redirect(`/c/${handle}`);
    }
}

export default function GetStarted() {

    const data = useLoaderData();

    const featuredCommunities = [
        {
            id: "wikid",
            name: "Wikid Beta Testers 💖",
            members: 100
        }
    ];

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
                            style={{
                                width: 400,
                            }}
                        />
                    </TextField.Root>
                </Flex>
            </nav>
            <Flex direction="row" pt="8" align="start" justify="center" wrap="wrap" gap="9" className='wk-under-content'>
                <Card style={{
                    maxWidth: 400,
                    width: "100%"
                }} size="4">
                    <Flex direction="column" gap="4">
                        <Heading>Create your community</Heading>
                        <Text>Start your own community and invite friends to join.</Text>
                        {!!(data?.me) ? <Dialog.Root>
                            <label>
                                <Dialog.Trigger>
                                    <Button radius='full'>Create community</Button>
                                </Dialog.Trigger>
                            </label>
                            <CreateCommunityDialog />
                        </Dialog.Root> : <Link href='/signup'>
                            <Button radius='full'>Create community</Button>
                        </Link>}
                    </Flex>
                </Card>
                <Card style={{ maxWidth: 400, width: "100%" }} size="4">
                    <Flex direction="column" gap="4">
                        <Heading>Join a community</Heading>
                        <Text>Search for a community to join.</Text>
                        <Text weight="bold" size="2">Featured communities</Text>
                        {featuredCommunities.map((c) => {
                            return <Link   key={`fcm-${c.id}`} href={`/c/${c.id}`}>
                                <Button variant="ghost" style={{ width: "100%" }}>
                                    <Flex align="start" justify="start" direction="column" gap="1" style={{
                                        width: "100%",
                                    }}>
                                        <Text size="3" style={{ color: "var(--gray-12)" }}><Strong>{c.name}</Strong></Text>
                                        <Text color='green' size="2">{`${c.members} members`}</Text>
                                    </Flex>
                                </Button>
                            </Link>
                        })}
                    </Flex>
                </Card>
            </Flex>
        </Flex>
    );
}
