import { redirect, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import {
    UNEXPECTED_ERROR_MESSAGE,
    me,
    community,
    leaveCommunity,
    createInvite,
    joinCommunity,
    createChannel,
    editChannel,
    deleteChannel,
    createGroup,
    editGroup,
    deleteGroup } from "../wikid.server.js";
import CommunityMenu from "../components/community-menu.jsx";
import { authorize } from "../sessions.server.js";
import environment from "../environment.server.js";

export const shouldRevalidate = () => {
    return true;
};

export const loader = async ({ request, params }) => {
    const jwt = await authorize(request);

    const handle = params.handle;

    let mr;
    let cr;

    if (!!handle && !!jwt) {
        const requests = [community(handle, jwt), me(jwt)];

        const v = await Promise.all(requests);

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

    return json({
        webUrl: environment.webUrl,
        me: mr,
        community: cr,
    });
}

export async function action({ request }) {
    const body = await request.formData();

    const jwt = await authorize(request);

    const type = body.get("__action");

    if (type == "edit_channel") {

        const communityHandle = body.get("communityHandle");
        const channelId = body.get("channelId");
        const channelHandle = body.get("channelHandle");
        const name = body.get("name");
        const groupId = body.get("groupId") == "undefined" ? null : body.get("groupId");

        const [response, errors, __] = await editChannel(communityHandle, name, groupId, channelId, jwt);

        if (!!response?.handle) {
            if (response.handle != channelHandle) {
                throw redirect(`/c/${communityHandle}/${response.handle}`);
            } else {
                return json({ updated: true });
            }
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
    } else if (type == "edit_group") {

        const communityHandle = body.get("communityHandle");
        const name = body.get("name");
        const groupId = body.get("groupId");

        const [data, errors] = await editGroup(communityHandle, groupId, name, jwt);

        if (!!errors) {
            return json(errors);
        }

        return json(data);

    } else if (type == "create_group") {

        const communityHandle = body.get("communityHandle");
        const name = body.get("name");

        const [data, errors] = await createGroup(communityHandle, name, jwt);

        if (!!errors) {
            return json(errors);
        }

        return json(data);
    } else if (type == "delete_group") {

        const communityHandle = body.get("communityHandle");
        const groupId = body.get("groupId");

        const [data, errors] = await deleteGroup(communityHandle, groupId, jwt);

        if (!!errors) {
            return json(errors);
        }

        if (!!(data?.ok)) {
            throw redirect(`/c/${communityHandle}/`);
        }

        return json(data);
    } else if (type == "delete_channel") {
        const communityHandle = body.get("communityHandle");
        const channelId = body.get("channelId");

        const [data, errors] = await deleteChannel(communityHandle, channelId, jwt);

        if (!!errors) {
            return json(errors);
        }

        return json(data);
    } else if (type == "leave_community") {
        const communityHandle = body.get("communityHandle");

        const [_, errors] = await leaveCommunity(communityHandle, jwt);

        if (!!errors) {
            return json(errors);
        }

        throw redirect("/c/get-started");
    }  else if (type == "join_community") {
        const communityHandle = body.get("communityHandle");

        const [_, errors] = await joinCommunity(communityHandle, jwt);

        if (!!errors) {
            throw redirect("/join-beta");
        }

        throw redirect(`/c/${communityHandle}`);
    } else if (type == "create_invite") {
        const communityHandle = body.get("communityHandle");
        const expiresOnUse = body.get("expiresOnUse") == "true";

        const [data, errors] = await createInvite(communityHandle, expiresOnUse, jwt);

        return json({
            invite: data?.code,
            errors: errors
        });
    }

    return json({ errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] });
}

export default function CommunityNavigation() {
    return (
        <>
            <CommunityMenu />
            <Outlet />
        </>);
}
