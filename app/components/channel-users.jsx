import { Text, Flex, Avatar, ContextMenu } from '@radix-ui/themes';
import { friendlyName, avatarFallback } from "./helpers";
import { Image } from "@unpic/react";

import './styles.channel-users.css';

function ChannelUserGroup(props) {
    const { users, name, color, me, kickUsers, banUsers } = props;

    if (!users || users.length == 0) {
        return <div />;
    }

    return (
        <>
            <Flex direction="column" gap="2" p="0">
                <Text weight="bold" size="1" color="gray" style={{ cursor: "default" }}>
                    {`${name.toUpperCase()}`} - {users.length}
                </Text>
                {users.map((o) => <ChannelUser color={color} key={`cu-${o.handle}`} user={o} me={me} kickUsers={kickUsers} banUsers={banUsers} />)}
            </Flex>
        </>
    );
}

function ChannelUser(props) {
    const { user, color, me, kickUsers, banUsers } = props;
    const name = friendlyName(user.name, user.handle);
    const fb = avatarFallback(name);

    const selfMenu = <>
        <ContextMenu.Item color="red">Leave community</ContextMenu.Item>
    </>;

    const otherMenu = <>
        {!!me ? <>
            <ContextMenu.Item color="red">Report</ContextMenu.Item>
            <ContextMenu.Item color="red">Block</ContextMenu.Item>
        </> : <>
            <ContextMenu.Item color="red">Report</ContextMenu.Item>
        </>}
        {(kickUsers || banUsers) && <ContextMenu.Separator />}
        {kickUsers && <ContextMenu.Item color="red">Kick</ContextMenu.Item>}
        {banUsers && <ContextMenu.Item color="red">Ban</ContextMenu.Item>}
    </>;

    const isSelf = (user.handle === me?.handle);

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger>
                <Flex direction="row" p="1" gap="4" align="center" data-accent-color={color} className='wk-channel-user-button rt-reset rt-BaseButton rt-Button rt-variant-ghost'>
                    {!!user.avatar_url ?
                        <Image
                            className='wk-radius-full-size-3'
                            src={user.avatar_url}
                            layout="constrained"
                            width={40}
                            height={40}
                            alt={user.handle}
                        />
                        :
                        <Avatar
                            color="gray"
                            fallback={fb}
                            radius='full'
                            size="3" />}
                    <Text size="1" weight="bold">{name}</Text>
                </Flex>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
                {isSelf ? selfMenu : otherMenu}
            </ContextMenu.Content>
        </ContextMenu.Root>
    );
}

export default function ChannelUsers(props) {
    const { channel, community } = props;

    const prominentRoles = channel.prominent_roles;
    const onlineUsers = channel.others_online;
    const offlineUsers = channel.others_offline;
    const me = channel.user;
    const kickUsers = community.permissions.kick_members;
    const banUsers = community.permissions.ban_members;

    return (
        <section className='wk-channel-users' onContextMenu={(e) => { e.preventDefault() }}>
            {prominentRoles.map((o) => <ChannelUserGroup
                key={`cug-${o.id}`}
                me={me}
                kickUsers={kickUsers}
                banUsers={banUsers}
                name={o.name}
                color={o.color}
                users={o.users} />)}
            <ChannelUserGroup
                me={me}
                kickUsers={kickUsers}
                banUsers={banUsers}
                name="Online"
                color="gray"
                users={onlineUsers} />
            <ChannelUserGroup
                me={me}
                kickUsers={kickUsers}
                banUsers={banUsers}
                name="Offline"
                color="gray"
                users={offlineUsers} />
        </section>
    );
}
