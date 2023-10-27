import { Flex, Text, Card, IconButton, Tabs, Callout, Box, TextField, Checkbox, Strong, Table } from '@radix-ui/themes';
import { json, redirect } from "@remix-run/node";
import { useState, useCallback, useEffect } from "react";
import { useLoaderData, Link, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { sessionStorage, authorize } from "../sessions.server.js";
import { community, communityUsers, createRole } from '../wikid.server.js';
import ContextSaveToolbar from '../components/context-save-toolbar.jsx';
import { CheckIcon, ChevronLeftIcon, InfoCircledIcon } from '@radix-ui/react-icons';

export const meta = () => {
    return [
        {
            title: "Wikid | community settings | roles"
        },
        {
            property: "og:title",
            content: "Wikid | community settings | roles",
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

    if (action == "create_role") {

        const communityHandle = body.get("communityHandle");
        const input = body.get("input");

        const [response, errors] = await createRole(communityHandle, input, jwt);

        if (!!errors) {
            return json({ errors: errors });
        }

        if (!!response?.id) {

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
    }

    return json({});
}

export const loader = async ({ request, params }) => {
    const jwt = await authorize(request);

    if (!jwt) {
        return redirect('/c/get-started');
    }

    const handle = params.handle;

    const v = await Promise.all([community(handle, jwt), communityUsers(handle, jwt)]);

    const [communityData, communityErrors] = v[0];
    const [usersData, usersErrors] = v[1];

    if (communityData?.permissions?.manage_community == false) {
        return redirect(`/c/${handle}`);
    }

    return json({
        handle: handle,
        community: communityData,
        users: usersData,
        errors: communityErrors ?? usersErrors,
    });
}

export default function CommunitySettingsRoles() {
    const data = useLoaderData();

    const community = data.community;

    const navigation = useNavigation();
    const submit = useSubmit();
    const actionData = useActionData();

    // Display
    const [name, setName] = useState("");
    const [color, setColor] = useState("gray");
    const [showOnlineDifferently, setShowOnlineDifferently] = useState(false);
    const [allowEveryone, setAllowEveryone] = useState(false);

    // Permissions
    const [viewChannels, setViewChannels] = useState(true);
    const [mannageChannels, setManageChannels] = useState(false);
    const [mannageCommunity, setManageCommunity] = useState(false);
    const [createInvite, setCreateInvite] = useState(true);
    const [kickMembers, setKickMembers] = useState(false);
    const [banMembers, setBanMembers] = useState(false);
    const [sendMessages, setSendMessages] = useState(true);
    const [attachMedia, setAttachMedia] = useState(true);

    // Members
    const [users, setUsers] = useState(data.users);
    const [usersInRole, setUsersInRole] = useState([]);

    // Searching

    const [searchMember, setSearchMember] = useState("");

    // Validation
    const [valid, setValid] = useState(false);
    const [errors, setErrors] = useState(false);
    const isBusy = navigation.state !== "idle";

    // Animations
    const [hasChanges, setHasChanges] = useState(false);

    const colors = ["tomato", "red", "ruby", "crimson", "pink", "plum",
        "purple", "violet", "iris", "indigo", "blue", "cyan",
        "teal", "jade", "green", "grass", "brown", "orange",
        "sky", "mint", "lime", "yellow", "amber", "gold",
        "bronze", "gray"];

    const handleCreateRole = useCallback(() => {
        if (!valid || !community) {
            return;
        }

        const communityHandle = community.handle;

        setErrors(null);

        const input = {
            name: name,
            show_online_differently: showOnlineDifferently,
            color: color,
            view_channels: viewChannels,
            manage_channels: mannageChannels,
            manage_community: mannageCommunity,
            create_invite: createInvite,
            kick_members: kickMembers,
            ban_members: banMembers,
            send_messages: sendMessages,
            attach_media: attachMedia,
            members: usersInRole,
        };

        const data = {
            __action: "create_role",
            input: JSON.stringify(input),
            communityHandle: communityHandle,
        };

        submit(data, { method: "post" });

    }, [community, name, showOnlineDifferently, viewChannels, mannageChannels, mannageCommunity, createInvite, kickMembers, banMembers, sendMessages, attachMedia, color, valid, community, usersInRole]);

    const toggleUserInRole = useCallback((userId) => {
        setHasChanges(true);
        const index = usersInRole.indexOf(userId);
        if (index === -1) {
            setUsersInRole([...usersInRole, userId]);
        } else {
            const cpy = [...usersInRole];
            cpy.splice(index, 1)
            setUsersInRole(cpy);
        }
    }, [usersInRole]);

    useEffect(() => {
        setValid(name.length >= 3);
    }, [name]);

    useEffect(() => {
        setErrors(actionData?.errors);
    }, [actionData]);

    useEffect(() => {
        if (searchMember.length > 0) {
            setHasChanges(true);
        }

        if (searchMember.length == 0) {
            setUsers(data.users);
        } else {
            setUsers(data.users.filter((u) => (u.handle.includes(searchMember) || u.name.includes(searchMember))));
        }
    }, [searchMember, data.users]);

    return (
        <div style={{ width: "100%", position: "relative" }}>
            <Flex direction="column" gap="0" className="wk-main-content">
                <nav className='wk-heading'>
                    <Link to={`/s/${community.handle}/settings/roles`} className='rt-reset wk-align-center'>
                        <IconButton aria-label="Go back" size="2" color='gray' variant='ghost'>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Link>
                    <Text weight="bold">Create role</Text>
                </nav>
                <Flex p="4" gap="4" direction="column" className='wk-under-content'>
                    {!!errors && <Callout.Root color='red' className='wk-form-element'>
                        <Callout.Icon>
                            <InfoCircledIcon />
                        </Callout.Icon>
                        <Callout.Text>
                            {errors[0].message}
                        </Callout.Text>
                    </Callout.Root>}
                    <Tabs.Root defaultValue="display">
                        <Tabs.List>
                            <Tabs.Trigger value="display">Display</Tabs.Trigger>
                            <Tabs.Trigger value="permissions">Permissions</Tabs.Trigger>
                            <Tabs.Trigger value="members">Members</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content value="display" className='wk-form-element'>
                            <Flex direction="column" gap="4" pt="4">
                                <Box>
                                    <Text as="div" size="2" mb="1" weight="bold">
                                        Role name
                                    </Text>
                                    <TextField.Input
                                        type='text'
                                        value={name}
                                        placeholder="Name of role"
                                        onChange={(v) => {
                                            setHasChanges(true);
                                            setName(v.currentTarget.value);
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Text as="div" size="2" mb="1" weight="bold">
                                        Role color
                                    </Text>
                                    <Flex direction="row" gap="2" wrap="wrap">
                                        {colors.map((o) => <IconButton onClick={() => {
                                            setColor(o);
                                            setHasChanges(true);
                                        }} radius='full' size="1" key={o} color={o}>
                                            {o == color ? <CheckIcon /> : ''}
                                        </IconButton>)}
                                    </Flex>
                                </Box>
                                <Text as="label" size="2">
                                    <Flex gap="2">
                                        <Checkbox aria-label='Display role members differently from online members' checked={showOnlineDifferently} onCheckedChange={(o) => {
                                            setHasChanges(true);
                                            setShowOnlineDifferently(o);
                                        }} /> Display role members differently from online members.
                                    </Flex>
                                </Text>
                                <Text as="label" size="2">
                                    <Flex gap="2">
                                        <Checkbox aria-label='Allow anyone to @mention this role' checked={allowEveryone} onCheckedChange={(o) => {
                                            setHasChanges(true);
                                            setAllowEveryone(o);
                                        }} /> <span>Allow anyone to <Strong as="span">@mention</Strong> this role.</span>
                                    </Flex>
                                </Text>
                                <Box pb="9">
                                </Box>
                            </Flex>
                        </Tabs.Content>
                        <Tabs.Content value="permissions" className='wk-form-element'>
                            <Flex direction="column" gap="4" pt="4" pb="9">
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
                        </Tabs.Content>
                        <Tabs.Content value="members" className='wk-form-element'>
                            <Flex direction="column" gap="4" pt="4" pb="9">
                                <Box>
                                    <Text as="div" size="2" mb="1" weight="bold">
                                        Member name
                                    </Text>
                                    <TextField.Input
                                        type='text'
                                        value={searchMember}
                                        placeholder="Name of member"
                                        onChange={(v) => {
                                            setSearchMember(v.currentTarget.value);
                                        }}
                                    />
                                </Box>
                                <Table.Root className="wk-form-element" variant='surface'>
                                    {users.length > 0 && <Table.Header>
                                        <Table.Row>
                                            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                                            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                                            <Table.ColumnHeaderCell>Handle</Table.ColumnHeaderCell>
                                        </Table.Row>
                                    </Table.Header>}
                                    <Table.Body>
                                        {users.length > 0 ? users.map((u) => <Table.Row onClick={() => toggleUserInRole(u.id)} key={u.handle} className='wk-table-row wk-buttonable'>
                                            <Table.Cell><Flex justify="center" align="center"><Checkbox checked={usersInRole.includes(u.id)} onCheckedChange={(_) => toggleUserInRole(u.id)} className='wk-buttonable' /></Flex></Table.Cell>
                                            <Table.Cell>{u.name}</Table.Cell>
                                            <Table.Cell><Strong>@{u.handle}</Strong></Table.Cell>
                                        </Table.Row>) :
                                            <Table.Row className='wk-table-row'>
                                                <Table.Cell>No matches for {searchMember}</Table.Cell>
                                            </Table.Row>}
                                    </Table.Body>
                                </Table.Root>
                                <Box pb="3">
                                </Box>
                            </Flex>
                        </Tabs.Content>
                    </Tabs.Root>
                </Flex>
            </Flex>
            {hasChanges && <ContextSaveToolbar
                                hasChanges={hasChanges}
                                discard={() => {
                                    window.location.href = `/s/${community.handle}/settings/roles`;
                                }}
                                save={() => {
                                    if (!isBusy) {
                                        handleCreateRole();
                                    }
                                }}
                            />}
        </div>
    );
}
