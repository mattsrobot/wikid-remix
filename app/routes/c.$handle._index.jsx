import { Button, Heading, Text, Dialog, Flex, Link } from '@radix-ui/themes';
import { json } from "@remix-run/node";
import { authorize } from "../sessions.server.js";
import { useLoaderData } from "@remix-run/react";
import { community } from "../wikid.server.js";
import CreateCommunityDialog from '../components/create-community-dialog.jsx';

export const loader = async ({ request, params }) => {
    const jwt = await authorize(request);

    const authorized = !!jwt;
    const handle = params.handle;

    const [data, errors, status] = await community(handle, jwt);

    return json({
        handle: handle,
        community: data,
        errors: errors,
        status: status,
        authorized: authorized
    });
}

export const meta = ({ data }) => {
    if (!!data.community) {
        return [
            {
                title: data.community.name,
            },
            {
                property: "og:title",
                content: data.community.name,
            },
            {
                name: "description",
                content: "Wikid community",
            },
        ];
    } else {
        return [
            {
                title: "Wikid | start a community"
            },
            {
                property: "og:title",
                content: "Wikid | start a community",
            },
            {
                name: "description",
                content: "Start a community on Wikid",
            },
        ];
    }
};

export default function Community() {
    const data = useLoaderData();

    const community = data.community;

    if (!!community) {
        return (
            <Flex direction="column" gap="0" className="wk-main-content">
                <nav className='wk-heading'>
                    <Text size="3" weight="bold">Select a channel 👀</Text>
                </nav>
                <Flex p="4" gap="4" direction="column" className='wk-under-content'>

                </Flex>
            </Flex>
        );
    }

    const handle = data.handle;

    if (!!handle && handle.length > 0) {
        const friendlyHandle = handle.charAt(0).toUpperCase() + handle.slice(1);

        return (
            <Flex direction="column" gap="0" className="wk-main-content">
                <nav className='wk-heading'>
                    <Text size="3" weight="bold">&nbsp;</Text>
                </nav>
                <Flex pt="5" gap="4" direction="column" align="center" justify="center" className='wk-under-content'>
                    <Heading>Nobody has claimed <Text color="violet">{friendlyHandle}</Text> yet 👀</Heading>
                    <Text>It could be yours! 🔥</Text>
                    {!!data?.authorized ? <Dialog.Root>
                        <label>
                            <Dialog.Trigger>
                                <Button radius='full'>Claim this community</Button>
                            </Dialog.Trigger>
                        </label>
                        <CreateCommunityDialog />
                    </Dialog.Root> : <Link href='/signup'>
                        <Button radius='full'>Claim this community</Button>
                    </Link>}
                </Flex>

            </Flex>
        );
    }

    return <></>
}
