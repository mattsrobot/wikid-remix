import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { channel, selectChannel, joinCommunity, editMessage, reactMessage } from "../wikid.server.js";
import CommunityChannel from '../components/community-channel.jsx';
import { authorize } from "../sessions.server.js";

export const loader = async ({ request, params }) => {
    const jwt = await authorize(request);

    const communityHandle = params.handle;
    const channelHandle = params.channelHandle;

    if (!!jwt) {
        selectChannel(communityHandle, channelHandle, jwt);
    }

    return json({
        communityHandle: communityHandle,
        channelHandle: channelHandle,
        channel: await channel(communityHandle, channelHandle, 0, jwt)
    });
}

export async function action({ request }) {

    const body = await request.formData();

    const jwt = await authorize(request);

    const type = body.get("__action");

    if (type == "react_to_message") {

        const communityHandle = body.get("communityHandle");
        const messageId = body.get("messageId");
        const reaction = body.get("reaction");

        const [response, errors] = await reactMessage(communityHandle, messageId, reaction, jwt);

        if (!!errors) {
            return json({ errors: errors });
        }

        if (!!response?.updated) {
            return json({ updated: true });
        }

    } else if (type == "edit_message") {

        if (!jwt) {
            throw redirect("/login");
        }

        const communityHandle = body.get("communityHandle");
        const messageId = body.get("messageId");
        const text = body.get("text");

        const [response, errors] = await editMessage(communityHandle, messageId, text, jwt);

        if (!!errors) {
            return json({ errors: errors });
        }

        if (!!response?.id) {
            return json({ updated: true });
        }
    } else if (type == "fetch_more_messages") {

        const communityHandle = body.get("communityHandle");
        const channelHandle = body.get("channelHandle");
        const page = body.get("page");

        return json({
            channel: await channel(communityHandle, channelHandle, page, jwt),
        });
    } else if (type == "join_community") {
        const communityHandle = body.get("communityHandle");

        const [_, errors] = await joinCommunity(communityHandle, jwt);

        if (!!errors) {
            throw redirect("/join-beta");
        }

        throw redirect(`/c/${communityHandle}`);
    }

    return json({});
}

export const meta = ({ data }) => {

    if (!!data?.communityHandle) {
        return [
            {
                title: `Wikid - ${data?.communityHandle} ${!!data?.channelHandle ? `| ${data?.channelHandle }`: "" }`,
            },
            {
                property: "og:title",
                content: `Wikid - ${data?.communityHandle} ${!!data?.channelHandle ? `| ${data?.channelHandle }`: "" }`,
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

export default function CommunityChannelRoot() {
    const data = useLoaderData();

    if (!data?.channel) {
        return null;
    }

    const [ channel ] = data.channel;

    if (!channel) {
        return null;
    }

    const { community } = channel;

    return <CommunityChannel
                channelHandle={channel.handle}
                community={community}
                channel={channel} />;
}
