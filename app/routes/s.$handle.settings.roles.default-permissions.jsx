import { Flex, Text, Card, IconButton, Callout, Checkbox } from '@radix-ui/themes';
import { json, redirect } from "@remix-run/node";
import { useState, useCallback, useEffect } from "react";
import { useLoaderData, Link, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { authorize, sessionStorage } from "../sessions.server.js";
import { defaultPermissions, editDefaultPermissions } from '../wikid.server.js';
import ContextSaveToolbar from '../components/context-save-toolbar.jsx';
import { ChevronLeftIcon } from '@radix-ui/react-icons';

export const meta = () => {
    return [
        {
            title: "Wikid | community settings | default permissions"
        },
        {
            property: "og:title",
            content: "Wikid | community settings | default permissions",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export async function action({ request }) {
    const body = await request.formData();

    const jwt = await authorize(request);

    const action = body.get("__action");

    if (action == "edit_default_permissions") {

        const communityHandle = body.get("communityHandle");
        const input = body.get("input");

        const [_, errors] = await editDefaultPermissions(communityHandle, input, jwt);

        if (!!errors) {
            return json({ errors: errors });
        }

        const cookie = request.headers.get("Cookie");
        const session = await sessionStorage.getSession(cookie);

        session.flash("message", "Saved");

        throw redirect(`/s/${communityHandle}/settings/roles`, {
            headers: {
                "Set-Cookie": await sessionStorage.commitSession(session, {
                    maxAge: 60 * 60 * 24 * 30,
                }),
            },
        });
    }

    return json({});
}

export const loader = async ({ request, params }) => {
    const jwt = await authorize(request);

    if (!jwt) {
        return redirect('/c/get-started');
    }

    const handle = params.handle;

    const [data, errors] = await defaultPermissions(handle, jwt);

    if (!!errors) {
        return redirect(`/c/${handle}`);
    }

    return json({
        handle: handle,
        permissions: data,
        errors: errors,
    });
}

export default function CommunitySettingsDefaultPermissions() {
    const data = useLoaderData();

    const communityHandle = data.handle;
    const permissions = data.permissions;

    const navigation = useNavigation();
    const submit = useSubmit();
    const actionData = useActionData();

    // Permissions
    const [viewChannels, setViewChannels] = useState(permissions.view_channels == true);
    const [mannageChannels, setManageChannels] = useState(permissions.manage_channels == true);
    const [mannageCommunity, setManageCommunity] = useState(permissions.manage_community == true);
    const [createInvite, setCreateInvite] = useState(permissions.create_invite == true);
    const [kickMembers, setKickMembers] = useState(permissions.kick_members == true);
    const [banMembers, setBanMembers] = useState(permissions.ban_members == true);
    const [sendMessages, setSendMessages] = useState(permissions.send_messages == true);
    const [attachMedia, setAttachMedia] = useState(permissions.attach_media == true);

    // Validation
    const [errors, setErrors] = useState(data.errors);
    const isBusy = navigation.state !== "idle";

    // Animations
    const [hasChanges, setHasChanges] = useState(false);

    const handleUpdatePermissions = useCallback(() => {
        setErrors(null);

        const input = {
            view_channels: viewChannels,
            manage_channels: mannageChannels,
            manage_community: mannageCommunity,
            create_invite: createInvite,
            kick_members: kickMembers,
            ban_members: banMembers,
            send_messages: sendMessages,
            attach_media: attachMedia,
        };

        const data = {
            __action: "edit_default_permissions",
            input: JSON.stringify(input),
            communityHandle: communityHandle,
        };

        submit(data, { method: "post" });

    }, [communityHandle, viewChannels, mannageChannels, mannageCommunity, createInvite, kickMembers, banMembers, sendMessages, attachMedia]);

    useEffect(() => {
        setErrors(actionData?.errors);
    }, [actionData]);

    return (
        <div style={{ width: "100%", position: "relative" }}>
            <Flex direction="column" gap="0" className="wk-main-content">
                <nav className='wk-heading'>
                    <Link to={`/s/${communityHandle}/settings/roles`} className='rt-reset wk-align-center'>
                        <IconButton aria-label="Go back" size="2" color='gray' variant='ghost'>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Link>
                    <Text weight="bold">Default permissions</Text>
                </nav>
                <Flex p="4" gap="4" direction="column" className='wk-under-content'>
                    {!!errors && <Callout.Root color='red'>
                        <Callout.Icon>
                            <InfoCircledIcon />
                        </Callout.Icon>
                        <Callout.Text>
                            {errors[0].message}
                        </Callout.Text>
                    </Callout.Root>}
                    <Text size="2">These permissions will apply to all members by default.</Text>
                    <Flex direction="column" gap="4" pb="9" className='wk-form-element'>
                        <Card className='wk-button-card' onClick={() => {
                            setHasChanges(true);
                            setViewChannels(!viewChannels);
                        }}>
                            <Flex direction="column">
                                <Flex direction="row" gap="4" justify="between" align="center" className='wk-fullwidth'>
                                    <Flex direction="column">
                                        <Text weight="bold" size="2">View channels</Text>
                                        <Text size="2" color='gray'>Allows members to view channels (excluding private channels).</Text>
                                    </Flex>
                                    <Checkbox size="2" aria-label='View channels' checked={viewChannels} onCheckedChange={(o) => {
                                        setHasChanges(true);
                                        setViewChannels(o);
                                    }} />
                                </Flex>
                            </Flex>
                        </Card>
                        <Card className='wk-button-card' onClick={() => {
                            setHasChanges(true);
                            setManageChannels(!mannageChannels);
                        }}>
                            <Flex direction="column">
                                <Flex direction="row" gap="4" justify="between" align="center" className='wk-fullwidth'>
                                    <Flex direction="column">
                                        <Text weight="bold" size="2">Manage channels</Text>
                                        <Text size="2" color='gray'>Allows members to modify channels of the community.</Text>
                                    </Flex>
                                    <Checkbox size="2" aria-label='View channels' checked={mannageChannels} onCheckedChange={(o) => {
                                        setHasChanges(true);
                                        setManageChannels(o);
                                    }} />
                                </Flex>
                            </Flex>
                        </Card>
                        <Card className='wk-button-card' onClick={() => {
                            setHasChanges(true);
                            setManageCommunity(!mannageCommunity);
                        }}>
                            <Flex direction="column">
                                <Flex direction="row" gap="4" justify="between" align="center" className='wk-fullwidth'>
                                    <Flex direction="column">
                                        <Text weight="bold" size="2">Manage community</Text>
                                        <Text size="2" color='gray'>Allows members to manage the settings of the comunity.</Text>
                                    </Flex>
                                    <Checkbox size="2" aria-label='View channels' checked={mannageCommunity} onCheckedChange={(o) => {
                                        setHasChanges(true);
                                        setManageCommunity(o);
                                    }} />
                                </Flex>
                            </Flex>
                        </Card>
                        <Card className='wk-button-card' onClick={() => {
                            setHasChanges(true);
                            setCreateInvite(!createInvite);
                        }}>
                            <Flex direction="column">
                                <Flex direction="row" gap="4" justify="between" align="center" className='wk-fullwidth'>
                                    <Flex direction="column">
                                        <Text weight="bold" size="2">Create invite</Text>
                                        <Text size="2" color='gray'>Allows members to create invites to the community.</Text>
                                    </Flex>
                                    <Checkbox size="2" aria-label='View channels' checked={createInvite} onCheckedChange={(o) => {
                                        setHasChanges(true);
                                        setCreateInvite(o);
                                    }} />
                                </Flex>
                            </Flex>
                        </Card>
                        <Card className='wk-button-card' onClick={() => {
                            setHasChanges(true);
                            setKickMembers(!kickMembers);
                        }}>
                            <Flex direction="column">
                                <Flex direction="row" gap="4" justify="between" align="center" className='wk-fullwidth'>
                                    <Flex direction="column">
                                        <Text weight="bold" size="2">Kick members</Text>
                                        <Text size="2" color='gray'>Allows members to kick people from the community.</Text>
                                    </Flex>
                                    <Checkbox size="2" aria-label='View channels' checked={kickMembers} onCheckedChange={(o) => {
                                        setHasChanges(true);
                                        setKickMembers(o);
                                    }} />
                                </Flex>
                            </Flex>
                        </Card>
                        <Card className='wk-button-card' onClick={() => {
                            setHasChanges(true);
                            setBanMembers(!banMembers);
                        }}>
                            <Flex direction="column">
                                <Flex direction="row" gap="4" justify="between" align="center" className='wk-fullwidth'>
                                    <Flex direction="column">
                                        <Text weight="bold" size="2">Ban members</Text>
                                        <Text size="2" color='gray'>Allows members ban people from the community.</Text>
                                    </Flex>
                                    <Checkbox size="2" aria-label='View channels' checked={banMembers} onCheckedChange={(o) => {
                                        setHasChanges(true);
                                        setBanMembers(o);
                                    }} />
                                </Flex>
                            </Flex>
                        </Card>
                        <Card className='wk-button-card' onClick={() => {
                            setHasChanges(true);
                            setSendMessages(!sendMessages);
                        }}>
                            <Flex direction="column">
                                <Flex direction="row" gap="4" justify="between" align="center" className='wk-fullwidth'>
                                    <Flex direction="column">
                                        <Text weight="bold" size="2">Send messages</Text>
                                        <Text size="2" color='gray'>Allows members send messages in text channels.</Text>
                                    </Flex>
                                    <Checkbox size="2" aria-label='Send messages' checked={sendMessages} onCheckedChange={(o) => {
                                        setHasChanges(true);
                                        setSendMessages(o);
                                    }} />
                                </Flex>
                            </Flex>
                        </Card>
                        <Card className='wk-button-card' onClick={() => {
                            setHasChanges(true);
                            setAttachMedia(!attachMedia);
                        }} mb="5">
                            <Flex direction="column">
                                <Flex direction="row" gap="4" justify="between" align="center" className='wk-fullwidth'>
                                    <Flex direction="column">
                                        <Text weight="bold" size="2">Attach media</Text>
                                        <Text size="2" color='gray'>Allows members attach files, photos and other media in messages.</Text>
                                    </Flex>
                                    <Checkbox size="2" aria-label='Attach media' checked={attachMedia} onCheckedChange={(o) => {
                                        setHasChanges(true);
                                        setAttachMedia(o);
                                    }} />
                                </Flex>
                            </Flex>
                        </Card>
                    </Flex>
                </Flex>
            </Flex>
            {hasChanges && <ContextSaveToolbar
                hasChanges={hasChanges}
                discard={() => {
                    window.location.href = `/s/${communityHandle}/settings/roles`;
                }}
                save={() => {
                    if (!isBusy) {
                        handleUpdatePermissions();
                    }
                }}
            />}
        </div>
    );
}
