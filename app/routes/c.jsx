import { Flex, Text, Button, Callout } from '@radix-ui/themes';
import { redirect, json } from "@remix-run/node";
import { authorize } from "../sessions.server.js";
import { Outlet, useLoaderData, useSubmit } from "@remix-run/react";
import { createCommunity, createChannel, community, me, leaveCommunity, joinCommunity, UNEXPECTED_ERROR_MESSAGE } from "../wikid.server.js";
import UserMenu from '../components/user-menu.jsx';
import { useCallback } from 'react';

export const shouldRevalidate = () => {
    return true;
};

export function ErrorBoundary() {
  return (
    <Flex>
        <Callout.Root color='red'>
            <Callout.Text>There was a problem loading this community.</Callout.Text>
        </Callout.Root>
    </Flex>
  );
}

export const loader = async ({ request, params }) => {
    const jwt = await authorize(request);

    const handle = params.handle;

    let mr;
    let cr;

    if (!!handle && !!jwt) {
        const v = await Promise.all([
            community(handle, jwt),
            me(jwt)
        ]);

        const [r1] = v[0];

        cr = r1;

        const [r2, errors] = v[1];

        if (!!errors) {
            return redirect('/login');
        }

        mr = r2;
    } else if (!!jwt) {
        const [r, errors] = await me(jwt);

        if (!!errors) {
            return redirect('/login');
        }

        mr = r;
    } else if (!!handle) {
        const [r] = await community(handle, jwt)

        cr = r;
    }

    const settings = request.url.includes("settings");

    return json({
        handle: handle,
        me: mr,
        community: cr,
        settings: settings,
        showJoin: cr?.show_can_join || false,
    });
}

export async function action({ request }) {
    const body = await request.formData();

    const jwt = await authorize(request);

    const type = body.get("__action");

    if (type == "create_community") {

        const name = body.get("name");
        const handle = body.get("handle");
        const _private = body.get("private") == "private";

        const [response, errors, __] = await createCommunity(name, handle, _private, jwt);

        if (!!response?.handle) {
            throw redirect(`/c/${handle}`);
        } else if (!!errors) {
            return json({ errors: errors });
        } else {
            return json({ errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] });
        }

    } else if (type == "create_channel") {

        const communityHandle = body.get("communityHandle");
        const name = body.get("name");
        const groupId = body.get("groupId") == "undefined" ? null : body.get("groupId");

        const [response, errors] = await createChannel(communityHandle, name, groupId, jwt);

        if (!!errors) {
            return json(errors);
        }

        if (!!(response?.handle)) {
            throw redirect(`/c/${communityHandle}/${response.handle}`);
        }

    } else if (type == "leave_community") {
        const communityHandle = body.get("communityHandle");

        const [_, errors] = await leaveCommunity(communityHandle, jwt);

        if (!!errors) {
            return json(errors);
        }

        throw redirect("/c/get-started");
    } else if (type == "join_community") {
        const communityHandle = body.get("communityHandle");

        const [_, errors] = await joinCommunity(communityHandle, jwt);

        if (!!errors) {
            throw redirect("/join-beta");
        }

        throw redirect(`/c/${communityHandle}`);
    }

    return json({ errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] });
}

export default function CommunityRoot() {
    const data = useLoaderData();
    const submit = useSubmit();
    const { showJoin, community, handle } = data;

    const handleJoinCommunity = useCallback(() => {
        const data = {
            __action: "join_community",
            communityHandle: community.handle
        }
        submit(data, {
            method: "post",
        });
    }, [community]);

    return (
        <Flex direction="column" className={showJoin ? "wk-subtracting-header" : ""}>
            {showJoin && <Flex direction="row" align="center" justify="center" className='wk-community-join-banner'>
                <Text weight="bold">Want to join?</Text>
                <Button radius='full' highContrast color="blue" size="1" variant="solid" onClick={handleJoinCommunity}>
                    <Text weight="bold">Join community</Text>
                </Button>
            </Flex>}
            <div className='wk-community'>
                <UserMenu handle={handle} />
                <Outlet />
            </div>
        </Flex>
    );
}
