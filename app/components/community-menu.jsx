import { Text, Flex, Box, IconButton, Dialog, Strong, Avatar, Popover, ContextMenu, Button, TextField } from '@radix-ui/themes';
import { PlusIcon, GearIcon, ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useLoaderData, Link, NavLink, useSubmit, PrefetchPageLinks } from "@remix-run/react";
import * as Collapsible from '@radix-ui/react-collapsible';
import { useCallback, useState } from 'react';
import CreateChannelDialog from './create-channel-dialog.jsx';
import CreateGroupDialog from './create-group-dialog.jsx';
import EditChannelDialog from './edit-channel-dialog.jsx';
import EditGroupDialog from './edit-group-dialog.jsx';
import ConfirmDeleteGroupDialog from './confirm-delete-group-dialog.jsx';
import ConfirmDeleteChannelDialog from './confirm-delete-channel-dialog.jsx';
import { wkGhostButton } from './helpers.js';
import { friendlyName, avatarFallback } from "./helpers";
import CreateInviteDialog from './create-invite-dialog.jsx';
import { Image } from "@unpic/react";

import './styles.user-menu.css';

function TopChannels(props) {

    const { community, channels, manageChannels, me, canInvite, webUrl } = props;

    const [channel, setChannel] = useState(null);
    const submit = useSubmit();

    const [createChannelOpen, setCreateChannelOpen] = useState(false);
    const [editChannelOpen, setEditChannelOpen] = useState(false);
    const [deleteChannelOpen, setDeleteChannelOpen] = useState(false);
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [createInviteOpen, setCreateInviteOpen] = useState(false);

    const toggleEditChannelOpen = useCallback(() => {
        setEditChannelOpen(v => {
            if (v) {
                setChannel(null);
            }
            return !v;
        });
    }, []);

    const toggleDeleteChannelOpen = useCallback(() => {
        setDeleteChannelOpen(v => {
            if (v) {
                setChannel(null);
            }
            return !v;
        });
    }, []);

    const toggleCreateChannelOpen = useCallback(() => { setCreateChannelOpen(v => !v); }, []);
    const toggleCreateGroupOpen = useCallback(() => { setCreateGroupOpen(v => !v); }, []);
    const toggleInviteOpen = useCallback(() => { setCreateInviteOpen((v) => !v); }, []);

    const handleJoinCommunity = useCallback(() => {
        const data = {
            __action: "join_community",
            communityHandle: community.handle
        }
        submit(data, {
            method: "post",
        });
    }, [community]);

    const handleMarkAsRead = useCallback((channel) => {
        // setCreateGroupOpen(v => !v);
    }, []);

    return (
        <>
            <>
                <Dialog.Root open={createGroupOpen} onOpenChange={toggleCreateGroupOpen}>
                    <CreateGroupDialog community={community} closeDialog={() => setCreateGroupOpen(false)} />
                </Dialog.Root>
                <Dialog.Root open={createInviteOpen} onOpenChange={toggleInviteOpen}>
                    <CreateInviteDialog open={createInviteOpen} community={community} closeDialog={() => setCreateInviteOpen(false)} webUrl={webUrl} />
                </Dialog.Root>
            </>
            <>
                <Dialog.Root open={createChannelOpen} onOpenChange={toggleCreateChannelOpen}>
                    <CreateChannelDialog community={community} closeDialog={() => setCreateChannelOpen(false)} />
                </Dialog.Root>
                <Dialog.Root open={editChannelOpen} onOpenChange={toggleEditChannelOpen}>
                    <EditChannelDialog channel={channel} community={community} closeDialog={() => setEditChannelOpen(false)} />
                </Dialog.Root>
                <Dialog.Root open={deleteChannelOpen} onOpenChange={toggleDeleteChannelOpen}>
                    <ConfirmDeleteChannelDialog channel={channel} community={community} closeDialog={() => setDeleteChannelOpen(false)} />
                </Dialog.Root>
            </>
            <>
                {!!channels && channels.map((c) => <PrefetchPageLinks page={`/c/${community.handle}/${c.handle}`} />)}
            </>
            <Flex direction="column" gap="2" p="0">
                {!!channels && channels.map((channel) => {
                    const ur = channel.unread_count > 0;
                    const navLink = <Box pl="3" pr="3">
                        <NavLink prefetch='intent' aria-label={channel.name} draggable="false" preventScrollReset to={`/c/${community.handle}/${channel.handle}`} data-accent-color="gray" className={`wk-nav-link-channel wk-fullwidth wk-gear-toggle-parent ${wkGhostButton}`}>
                            {ur && <span className='wk-nav-link-unread' />}
                            <span style={{ color: ur ? "var(--color-text-on-light)" : "unset" }}>{channel.name}</span>
                            <div style={{ flexGrow: 1 }} />
                            {!!manageChannels && <IconButton aria-label="Edit channel" className='wk-gear-toggle' color="gray" variant="ghost" size="1" onClick={(e) => {
                                e.preventDefault();
                                setChannel(channel);
                                toggleEditChannelOpen();
                            }}>
                                <GearIcon />
                            </IconButton>}
                        </NavLink>
                    </Box>;

                    return <ContextMenu.Root key={`menu-${channel.id}`}>
                        <ContextMenu.Trigger>
                            {navLink}
                        </ContextMenu.Trigger>
                        <ContextMenu.Content>
                            {!!me ?
                                <ContextMenu.Item onSelect={() => handleMarkAsRead(channel)}>
                                    Mark as read
                                </ContextMenu.Item> :
                                <ContextMenu.Item color='green' onSelect={handleJoinCommunity}>
                                    Join community
                                </ContextMenu.Item>}
                            {manageChannels &&
                                <>
                                    <ContextMenu.Item onClick={() => {
                                        setChannel(channel);
                                        toggleEditChannelOpen();
                                    }}>
                                        Edit channel
                                    </ContextMenu.Item>
                                    <ContextMenu.Item onSelect={toggleCreateChannelOpen}>
                                        Create channel
                                    </ContextMenu.Item>
                                    <ContextMenu.Item onSelect={toggleCreateGroupOpen}>
                                        Create group
                                    </ContextMenu.Item>
                                </>}
                            {canInvite && <ContextMenu.Item onSelect={toggleInviteOpen} color="green">
                                Invite people
                            </ContextMenu.Item>}
                            {manageChannels && <ContextMenu.Item color="red" onSelect={() => {
                                setChannel(channel);
                                toggleDeleteChannelOpen();
                            }}>
                                Delete channel
                            </ContextMenu.Item>}
                        </ContextMenu.Content>
                    </ContextMenu.Root>;
                })}
            </Flex>
        </>
    );
}

function ChannelGroup(props) {
    const { canInvite, group, community, manageChannels, me, webUrl } = props;

    const submit = useSubmit();

    const [open, setOpen] = useState(true);
    const [channel, setChannel] = useState(null);

    const [createChannelOpen, setCreateChannelOpen] = useState(false);
    const [editChannelOpen, setEditChannelOpen] = useState(false);
    const [deleteChannelOpen, setDeleteChannelOpen] = useState(false);
    const [createInviteOpen, setCreateInviteOpen] = useState(false);
    const [createGroupOpen, setCreateGroupOpen] = useState(false);

    const [editGroupOpen, setEditGroupOpen] = useState(false);
    const [confirmDeleteGroupOpen, setConfirmDeleteGroupOpen] = useState(false);

    const toggleOpen = useCallback(() => {
        if (!!channel || createChannelOpen) {
            return;
        }
        setOpen(v => !v);
    }, [channel, createChannelOpen]);

    const toggleCreateGroupOpen = useCallback(() => { setCreateGroupOpen(v => !v); }, []);

    const toggleEditChannelOpen = useCallback(() => {
        setEditChannelOpen(v => {
            if (v) {
                setChannel(null);
            }
            return !v;
        });
    }, []);

    const toggleDeleteChannelOpen = useCallback(() => {
        setDeleteChannelOpen(v => {
            if (v) {
                setChannel(null);
            }
            return !v;
        });
    }, []);

    const toggleCreateChannelOpen = useCallback(() => { setCreateChannelOpen(v => !v); }, []);
    const toggleEditGroupOpen = useCallback(() => { setEditGroupOpen(v => !v); }, []);
    const toggleConfirmDeleteGroupOpen = useCallback(() => { setConfirmDeleteGroupOpen(v => !v); }, []);
    const toggleInviteOpen = useCallback(() => { setCreateInviteOpen((v) => !v); }, []);

    const handleJoinCommunity = useCallback(() => {
        const data = {
            __action: "join_community",
            communityHandle: community.handle
        }
        submit(data, {
            method: "post",
        });
    }, [community]);

    const contextMenu = <>
        {!!me ?
            <>
                <ContextMenu.Item>
                    Mark as read
                </ContextMenu.Item>
            </> :
            <>
                <ContextMenu.Item color='green' onSelect={handleJoinCommunity}>
                    Join community
                </ContextMenu.Item>
            </>}
        {manageChannels &&
            <>
                <ContextMenu.Item onSelect={toggleEditGroupOpen}>
                    Edit group
                </ContextMenu.Item>
                <ContextMenu.Item onSelect={toggleCreateChannelOpen}>
                    Create channel in group
                </ContextMenu.Item>
            </>}
        {canInvite && <ContextMenu.Item color="green" onSelect={toggleInviteOpen}>
            Invite people
        </ContextMenu.Item>}
        {manageChannels && <>
            <ContextMenu.Item color="red" onSelect={toggleConfirmDeleteGroupOpen}>
                Delete group
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item onSelect={toggleCreateGroupOpen}>
                Create group
            </ContextMenu.Item>
        </>}
    </>

    return (
        <>
            <>
                <Dialog.Root open={createChannelOpen} onOpenChange={toggleCreateChannelOpen}>
                    <CreateChannelDialog group={group} community={community} closeDialog={() => setCreateChannelOpen(false)} webUrl={webUrl} />
                </Dialog.Root>
                <Dialog.Root open={createGroupOpen} onOpenChange={toggleCreateGroupOpen}>
                    <CreateGroupDialog community={community} closeDialog={() => setCreateGroupOpen(false)} />
                </Dialog.Root>
                <Dialog.Root open={editChannelOpen} onOpenChange={toggleEditChannelOpen}>
                    <EditChannelDialog channel={channel} group={group} community={community} closeDialog={() => setEditChannelOpen(false)} />
                </Dialog.Root>
                <Dialog.Root open={deleteChannelOpen} onOpenChange={toggleDeleteChannelOpen}>
                    <ConfirmDeleteChannelDialog channel={channel} community={community} closeDialog={() => setDeleteChannelOpen(false)} />
                </Dialog.Root>
                <Dialog.Root open={createInviteOpen} onOpenChange={toggleInviteOpen}>
                    <CreateInviteDialog open={createInviteOpen} community={community} closeDialog={() => setCreateInviteOpen(false)} />
                </Dialog.Root>
            </>
            <>
                <Dialog.Root open={editGroupOpen} onOpenChange={toggleEditGroupOpen}>
                    <EditGroupDialog group={group} community={community} closeDialog={() => setEditGroupOpen(false)} />
                </Dialog.Root>
                <Dialog.Root open={confirmDeleteGroupOpen} onOpenChange={toggleConfirmDeleteGroupOpen}>
                    <ConfirmDeleteGroupDialog group={group} community={community} closeDialog={() => setConfirmDeleteGroupOpen(false)} />
                </Dialog.Root>
            </>
            <Collapsible.Root open={open} onOpenChange={toggleOpen} style={{ cursor: "default" }}>
                <ContextMenu.Root>
                    <ContextMenu.Trigger>
                        <Flex direction="row" gap="1" pt="3" pb="0" p="3">
                            {open ?
                                <ChevronDownIcon style={{ color: "var(--color-text-group)" }} onClick={toggleOpen} /> :
                                <ChevronRightIcon style={{ color: "var(--color-text-group)" }} onClick={toggleOpen} />}
                            <Text weight="bold" size="1" style={{ cursor: "default", color: "var(--color-text-group)" }} onClick={toggleOpen}>
                                {`${group.name.toUpperCase()}`}
                            </Text>
                            <div style={{ flexGrow: 1 }} />
                            {!!manageChannels &&
                                <IconButton aria-label="Create channel" style={{ color: "var(--color-text-group)" }} variant="ghost" size="1" onClick={toggleCreateChannelOpen}>
                                    <PlusIcon />
                                </IconButton>}
                        </Flex>
                    </ContextMenu.Trigger>
                    <ContextMenu.Content>
                        {contextMenu}
                    </ContextMenu.Content>
                </ContextMenu.Root>
                <Collapsible.Content>
                    <Collapsible.Trigger asChild>
                        <ContextMenu.Root>
                            <ContextMenu.Trigger>
                                <Flex direction="column" gap="3" pt="2" pl="3" pr="3" pb="0">
                                    {group.channels.map((channel) => {
                                        const ur = channel.unread_count > 0;
                                        return <ContextMenu.Root key={`ccmu-${channel.id}`}>
                                            <ContextMenu.Trigger>
                                                <NavLink prefetch='intent' aria-label={channel.name} draggable="false" preventScrollReset={true} to={`/c/${community.handle}/${channel.handle}`} data-accent-color="gray" className={`wk-nav-link-channel wk-fullwidth wk-gear-toggle-parent ${wkGhostButton}`}>
                                                    {ur && <span className='wk-nav-link-unread' />}
                                                    <span draggable="false" style={{ color: ur ? "var(--color-text-on-light)" : "unset" }}>{channel.name}</span>
                                                    <div draggable="false" style={{ flexGrow: 1 }} />
                                                    {!!manageChannels && <IconButton aria-label="Edit channel" className='wk-gear-toggle' color={channel.unread_count > 0 ? "white" : "gray"} variant="ghost" size="1" onClick={(e) => {
                                                        e.preventDefault();
                                                        setChannel(channel);
                                                        toggleEditChannelOpen();
                                                    }}>
                                                        <GearIcon />
                                                    </IconButton>}
                                                </NavLink>
                                            </ContextMenu.Trigger>
                                            <ContextMenu.Content>
                                                {!!me ?
                                                    <ContextMenu.Item>
                                                        Mark as read
                                                    </ContextMenu.Item> :
                                                    <ContextMenu.Item color='green' onSelect={handleJoinCommunity}>
                                                        Join community
                                                    </ContextMenu.Item>}

                                                {manageChannels && <>
                                                    <ContextMenu.Item onSelect={() => {
                                                        setChannel(channel);
                                                        toggleEditChannelOpen();
                                                    }}>
                                                        Edit channel
                                                    </ContextMenu.Item>
                                                    <ContextMenu.Item onSelect={toggleCreateChannelOpen}>
                                                        Create channel in group
                                                    </ContextMenu.Item>
                                                </>}
                                                {canInvite && <ContextMenu.Item color='green' onSelect={toggleInviteOpen}>
                                                    Invite people
                                                </ContextMenu.Item>}
                                                {manageChannels && <>
                                                    <ContextMenu.Item color="red" onSelect={() => {
                                                        setChannel(channel);
                                                        toggleDeleteChannelOpen();
                                                    }}>
                                                        Delete channel
                                                    </ContextMenu.Item>
                                                    <ContextMenu.Separator />
                                                    <ContextMenu.Item onSelect={toggleCreateGroupOpen}>
                                                        Create group
                                                    </ContextMenu.Item>
                                                </>}
                                            </ContextMenu.Content>
                                        </ContextMenu.Root>;
                                    })}
                                </Flex>
                            </ContextMenu.Trigger>
                            <ContextMenu.Content>
                                {contextMenu}
                            </ContextMenu.Content>
                        </ContextMenu.Root>
                    </Collapsible.Trigger>
                </Collapsible.Content>
            </Collapsible.Root>
        </>
    );
}

function ChannelsList(props) {

    const { channelGroups, manageChannels, manageCommunity, canInvite, serverOwner, community, me, webUrl } = props;

    const submit = useSubmit();

    const name = friendlyName(me?.name, me?.handle);
    const fb = avatarFallback(name);

    const [createChannelOpen, setCreateChannelOpen] = useState(false);
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [createInviteOpen, setCreateInviteOpen] = useState(false);

    const toggleCreateChannelOpen = useCallback(() => { setCreateChannelOpen((v) => !v); }, []);
    const toggleCreateGroupOpen = useCallback(() => { setCreateGroupOpen((v) => !v); }, []);
    const toggleInviteOpen = useCallback(() => { setCreateInviteOpen((v) => !v); }, []);

    const handleLeaveCommunity = useCallback(() => {
        const data = {
            __action: "leave_community",
            communityHandle: community.handle,
        }
        submit(data, { method: "post" });
    }, [community]);

    const handleJoinCommunity = useCallback(() => {
        const data = {
            __action: "join_community",
            communityHandle: community.handle
        }
        submit(data, {
            method: "post",
        });
    }, [community]);

    const [comminityPopoverActive, setComminityPopoverActive] = useState(false);

    return (<>
        <Dialog.Root open={createInviteOpen} onOpenChange={toggleInviteOpen}>
            <CreateInviteDialog open={createInviteOpen} community={community} closeDialog={() => setCreateInviteOpen(false)} webUrl={webUrl} />
        </Dialog.Root>
        <Dialog.Root open={createGroupOpen} onOpenChange={toggleCreateGroupOpen}>
            <CreateGroupDialog community={community} closeDialog={() => setCreateGroupOpen(false)} />
        </Dialog.Root>
        <Dialog.Root open={createChannelOpen} onOpenChange={toggleCreateChannelOpen}>
            <CreateChannelDialog community={community} closeDialog={() => setCreateChannelOpen(false)} />
        </Dialog.Root>
        <nav className='wk-channels-list'>
            <Popover.Root open={comminityPopoverActive} onOpenChange={(o) => setComminityPopoverActive(o)}>
                <ContextMenu.Root>
                    <ContextMenu.Trigger>
                        <Popover.Trigger>
                            <button className='wk-community-description rt-reset rt-BaseButton wk-community-description-button' onClick={() => setComminityPopoverActive(true)}>
                                <Text weight="bold" size="3">{community.name}</Text>
                            </button>
                        </Popover.Trigger>
                    </ContextMenu.Trigger>
                    <ContextMenu.Content>
                        {manageChannels && <>
                            <ContextMenu.Item onSelect={toggleCreateChannelOpen}>Create channel</ContextMenu.Item>
                            <ContextMenu.Item onSelect={toggleCreateGroupOpen}>Create group</ContextMenu.Item>
                        </>}
                        {canInvite && <ContextMenu.Item color='green' onSelect={toggleInviteOpen}>Invite people</ContextMenu.Item>}
                        {manageChannels || canInvite && <ContextMenu.Separator />}
                        {manageCommunity ?
                            <Link prefetch='intent' to={`/s/${community.handle}/settings/overview`} className='rt-reset' aria-label="Community settings">
                                <ContextMenu.Item color='blue'>Community settings</ContextMenu.Item>
                            </Link> :
                            !!me ?
                                <ContextMenu.Item color='red' onSelect={handleLeaveCommunity}>Leave community</ContextMenu.Item> :
                                <ContextMenu.Item color='green' onSelect={handleJoinCommunity}>Join community</ContextMenu.Item>
                        }
                        {!serverOwner && manageCommunity && <ContextMenu.Item color='red' onSelect={handleLeaveCommunity}>Leave community</ContextMenu.Item>}
                    </ContextMenu.Content>
                </ContextMenu.Root>
                <Popover.Content>
                    <Flex direction="column" gap="3">
                        {manageCommunity && <Box>
                            <Link prefetch='intent' to={`/s/${community.handle}/settings/overview`} aria-label="Community settings" className='rt-reset rt-BaseButton rt-Button rt-r-size-1 rt-variant-solid' data-radius="full">
                                Community settings
                            </Link>
                        </Box>}
                        {canInvite && <Box>
                            <Button radius='full' variant='solid' size="1" color='green' onClick={toggleInviteOpen} aria-label="Invite people">
                                Invite people
                            </Button>
                        </Box>}
                        {!me && <Box>
                            <Button radius='full' size="1" variant="solid" color="green" onClick={handleJoinCommunity} aria-label="Join community">
                                Join community
                            </Button>
                        </Box>}
                        {!serverOwner && manageCommunity && <Box>
                            <Button radius='full' size="1" variant="soft" color="red" onClick={handleLeaveCommunity} aria-label="Leave community">
                                Leave community
                            </Button>
                        </Box>}
                    </Flex>
                </Popover.Content>
            </Popover.Root>
            <ContextMenu.Root>
                <ContextMenu.Trigger>
                    <Flex direction="column" p="0" gap="0">
                        <TopChannels
                            webUrl={webUrl}
                            me={me}
                            community={community}
                            manageChannels={manageChannels}
                            canInvite={canInvite}
                            channels={community.top_channels} />
                        {!!channelGroups && channelGroups.map((group) =>
                            <ChannelGroup
                                key={group.id}
                                webUrl={webUrl}
                                me={me}
                                manageChannels={manageChannels}
                                canInvite={canInvite}
                                group={group}
                                community={community}
                            />)}
                    </Flex>
                </ContextMenu.Trigger>
                <ContextMenu.Content>
                    {manageChannels && <>
                        <ContextMenu.Item onSelect={toggleCreateChannelOpen}>Create channel</ContextMenu.Item>
                        <ContextMenu.Item onSelect={toggleCreateGroupOpen}>Create group</ContextMenu.Item>
                    </>}
                    {canInvite && <ContextMenu.Item onSelect={toggleInviteOpen} color='green'>Invite people</ContextMenu.Item>}
                </ContextMenu.Content>
            </ContextMenu.Root>
            <ContextMenu.Root>
                <ContextMenu.Trigger>
                    <Box style={{ flexGrow: 1 }} />
                </ContextMenu.Trigger>
                <ContextMenu.Content>
                    {!!me ?
                        <>
                            {manageChannels && <>
                                <ContextMenu.Item onSelect={toggleCreateChannelOpen}>Create channel</ContextMenu.Item>
                                <ContextMenu.Item onSelect={toggleCreateGroupOpen}>Create group</ContextMenu.Item>
                            </>}
                            {canInvite && <ContextMenu.Item onSelect={toggleInviteOpen} color='green'>Invite people</ContextMenu.Item>}
                            {manageCommunity && <Link prefetch='intent' to={`/s/${community.handle}/settings/overview`} className='rt-reset' aria-label="Community settings" data-radius="full">
                                <ContextMenu.Item color='blue'>Community settings</ContextMenu.Item>
                            </Link>}
                        </> :
                        <>
                            <Link prefetch='intent' to='/signup' aria-label="Signup to Wikid" className='rt-reset'>
                                <ContextMenu.Item>Signup to Wikid</ContextMenu.Item>
                            </Link>
                            <Link prefetch='intent' to='/login' aria-label="Login to Wikid" className='rt-reset'>
                                <ContextMenu.Item>Login</ContextMenu.Item>
                            </Link>
                        </>}
                </ContextMenu.Content>
            </ContextMenu.Root>
            <div className='wk-user-connection'>
                {!me ?
                    <Flex direction="column" p="3" m="0" gap="2">
                        <Link prefetch='intent' to='/signup' aria-label="Signup to Wikid" className='rt-reset rt-BaseButton rt-Button rt-variant-ghost rt-r-size-2' data-radius="full">
                            <Text size="2">Signup to Wikid</Text>
                        </Link>
                        <Link prefetch='intent' to='/login' aria-label="Login" className='rt-reset rt-BaseButton rt-Button rt-variant-ghost rt-r-size-2' data-radius="full">
                            <Text size="2">Login</Text>
                        </Link>
                    </Flex> :
                    <Popover.Root>
                        <Popover.Trigger>
                            <button className='rt-reset rt-BaseButton wk-user-button'>
                                <Flex direction="row" align="center" gap="2">
                                    {!!me.avatar_url ?
                                        <Image
                                            className='wk-radius-full-size-2'
                                            src={me.avatar_url}
                                            layout="constrained"
                                            width={32}
                                            height={32}
                                            alt={me.handle}
                                        />
                                        :
                                        <Avatar
                                            color="gray"
                                            fallback={fb}
                                            radius='full'
                                            size="2" />}
                                    <Flex direction="column">
                                        <Text size="1" style={{ color: 'var(--gray-12)' }}><Strong>{name}</Strong></Text>
                                        <Text size="1" color='green'><Strong>online</Strong></Text>
                                    </Flex>
                                </Flex>
                            </button>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Flex gap="3" direction="column">
                                <TextField.Root>
                                    <TextField.Input
                                        placeholder='🍪 I love cookies'
                                    />
                                </TextField.Root>
                                <Box grow="1">
                                    <Flex gap="3" mt="3" justify="between">
                                        <Link prefetch='intent' aria-label="User preferences" to="/u/settings" className='rt-reset rt-BaseButton rt-Button rt-r-size-1 rt-variant-solid' data-radius="full">User preferences</Link>
                                        <Link prefetch='intent' aria-label="Logout" to="/logout" className='rt-reset rt-BaseButton rt-Button rt-r-size-1 rt-variant-soft' data-accent-color="red" data-radius="full">Logout</Link>
                                    </Flex>
                                </Box>
                            </Flex>
                        </Popover.Content>
                    </Popover.Root>}
            </div>
        </nav>
    </>);
}

export default function CommunityMenu() {

    const data = useLoaderData();

    const webUrl = data?.webUrl;
    const me = data?.me;
    const community = data?.community;
    const channelGroups = community?.channel_groups;

    if (!community) {
        return null;
    }

    let serverOwner = false;
    let manageCommunity = false;
    let manageChannels = false;
    let canInvite = false;

    if (!!me) {
        serverOwner = community.server_owner ?? false;
        manageCommunity = community.permissions?.manage_community ?? false;
        manageChannels = community.permissions?.manage_channels ?? false;
        canInvite = community.permissions?.create_invite ?? false;
    }

    return (
        <nav className='wk-community-nav' onContextMenu={(e) => { e.preventDefault() }}>
            <ChannelsList
                manageCommunity={manageCommunity}
                manageChannels={manageChannels}
                serverOwner={serverOwner}
                canInvite={canInvite}
                webUrl={webUrl}
                me={me}
                community={community}
                channelGroups={channelGroups} />
        </nav>
    );
}
