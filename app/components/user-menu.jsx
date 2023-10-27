import { IconButton, Dialog, Tooltip, ContextMenu, Text } from '@radix-ui/themes';
import { PlusIcon, MagnifyingGlassIcon, GearIcon } from '@radix-ui/react-icons';
import { useLoaderData, Link, NavLink, useSubmit } from "@remix-run/react";
import { useCallback, useState } from 'react';
import CreateCommunityDialog from '../components/create-community-dialog.jsx';
import CreateChannelDialog from './create-channel-dialog.jsx';

import { avatarFallback } from './helpers.js';

import './styles.user-menu.css';

export default function UserMenu() {

    const data = useLoaderData();
    const submit = useSubmit();

    const { handle, me } = data;

    const communities = me?.communities;

    const [community, setCommunity] = useState(null);

    const [createChannelOpen, setCreateChannelOpen] = useState(false);
    const [createGroupOpen, setCreateGroupOpen] = useState(false);

    const toggleCreateChannelOpen = useCallback((c) => {
        setCommunity(c);
        setCreateChannelOpen((v) => !v);
    }, []);

    const toggleCreateGroupOpen = useCallback((c) => {
        setCommunity(c);
        setCreateGroupOpen((v) => !v);
    }, []);

    const leaveCommunity = useCallback((community) => {
        const data = {
            __action: "leave_community",
            communityHandle: community.handle,
        }
        submit(data, { method: "post" });
    }, []);

    return (
        <nav className="wk-community-nav" onContextMenu={(e) => {e.preventDefault() }}>
            <Dialog.Root open={createChannelOpen} onOpenChange={() => toggleCreateChannelOpen(null)}>
                <CreateChannelDialog community={community} closeDialog={() => {
                    setCreateChannelOpen(false);
                    setCommunity(null);
                }} />
            </Dialog.Root>
            <nav className='wk-communities-list'>
                {!!communities && communities.map((c) => {
                    const serverOwner = c.server_owner ?? false;
                    const manageChannels = c.permissions?.manage_channels ?? false;

                    return <ContextMenu.Root key={`cdl-${c.id}`}>
                        <ContextMenu.Trigger>
                            <Link draggable="false" aria-label={`Community ${c.handle}`} to={`/c/${c.handle}/${c.default_channel}`} data-accent-color="gray" data-radius="full" className={`rt-reset rt-BaseButton rt-IconButton rt-r-size-4 rt-variant-surface wk-community-button ${handle == c.handle ? "active" : ""}`}>
                                <div className={`${handle == c.handle ? "wk-community-active" : "wk-community-hovered"}`} />
                                {c.unread_count > 0 && <div className='wk-channel-users-unread' />}
                                <Tooltip content={c.name} delayDuration={0} side='right'>
                                    <Text weight="bold" style={{ color: "var(--color-text-on-light)" }}>{avatarFallback(c.name)}</Text>
                                </Tooltip>
                            </Link>
                        </ContextMenu.Trigger>
                        <ContextMenu.Content>
                            {manageChannels && <ContextMenu.Item onSelect={() => toggleCreateChannelOpen(c)}>Create channel</ContextMenu.Item>}
                            {serverOwner ?
                                <Link aria-label="Community settings" to={`/s/${c.handle}/settings/overview`} className='rt-reset'>
                                    <ContextMenu.Item>Community settings</ContextMenu.Item>
                                </Link> :
                                <ContextMenu.Item color='red' onSelect={() => leaveCommunity(c)}>Leave community</ContextMenu.Item>}
                        </ContextMenu.Content>
                    </ContextMenu.Root>;
                })}
                {!!me ? <Dialog.Root>
                    <Dialog.Trigger>
                        <IconButton aria-label="Create a community" draggable="false" size="4" color='gray' radius='full' variant='surface'>
                            <Tooltip content="Create a community" delayDuration={0} side='right'>
                                <PlusIcon width="28" height="28" style={{ color: "var(--color-text-on-light)" }} />
                            </Tooltip>
                        </IconButton>
                    </Dialog.Trigger>
                    <CreateCommunityDialog />
                </Dialog.Root> :
                <NavLink aria-label="Community settings" draggable="false" to='/signup' data-accent-color="gray" data-radius="full" className='rt-reset rt-BaseButton rt-IconButton rt-r-size-4 rt-variant-surface'>
                    <Tooltip content="Create a community" delayDuration={0} side='right'>
                        <PlusIcon width="28" height="28" style={{ color: "var(--color-text-on-light)" }} />
                    </Tooltip>
                </NavLink>}
                <NavLink draggable="false" aria-label="Explore communities" to='/c/get-started' data-accent-color="gray" data-radius="full" className='rt-reset rt-BaseButton rt-IconButton rt-r-size-4 rt-variant-surface'>
                    <Tooltip content="Explore communities" delayDuration={0} side='right'>
                        <MagnifyingGlassIcon style={{ color: "var(--color-text-on-light)" }} width="28" height="28" />
                    </Tooltip>
                </NavLink>
                {!!me && <NavLink draggable="false" aria-label="User preferences" to='/u/settings' data-accent-color="gray" data-radius="full" className='rt-reset rt-BaseButton rt-IconButton rt-r-size-4 rt-variant-surface'>
                    <Tooltip content="Settings" delayDuration={0} side='right'>
                        <GearIcon style={{ color: "var(--color-text-on-light)" }} width="28" height="28" />
                    </Tooltip>
                </NavLink>}
            </nav>
        </nav>
    );
}
