import { Flex, Box } from '@radix-ui/themes';
import { redirect, json } from "@remix-run/node";
import { authorize } from "../sessions.server.js";
import { Outlet } from "@remix-run/react";
import { me, createCommunity, createChannel, leaveCommunity } from "../wikid.server.js";
import UserMenu from '../components/user-menu.jsx';

export const loader = async ({ request }) => {
    const jwt = await authorize(request);

    if (!jwt) {
        throw redirect('/logout')
    }

    const [data, errors] = await me(jwt);

    if (!!errors) {
        throw redirect('/logout')
    }

    const communities = data.communities;

    if (communities.length == 0 && !request.url.includes("get-started") && !request.url.includes("settings")) {
        throw redirect('/c/get-started')
    }

    return json({
        path: request.url,
        me: data
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

        const [_, errors] = await createCommunity(name, handle, _private, jwt);

        if (!!errors) {
            return json(errors);
        }

        throw redirect(`/c/${handle}`);

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
    }

    return json({})
}

export default function UserHome() {
    return (
        <Flex direction="row">
            <Box style={{
                height: "100vh",
                backgroundColor: "var(--color-panel-solid)",
            }}>
                <UserMenu />
            </Box>
            <Outlet />
        </Flex>
    );
}
