import { Heading, Flex } from '@radix-ui/themes';
import ChannelUsers from './channel-users.jsx';
import ChannelFeed from './channel-feed.jsx';
import ChannelHeader from './channel-header.jsx';
import { useState } from "react";

import './styles.community-channel.css';

export function CommunityChannelSkeleton() {
    return (
        <section className='wk-community-main'>
            <div className='wk-channel-main'>
                <section className='wk-channel-header' onContextMenu={(e) => { e.preventDefault() }} />
                <section className='wk-channel-feed' onContextMenu={(e) => { e.preventDefault() }} />
            </div>
            <section className='wk-channel-users' onContextMenu={(e) => { e.preventDefault() }} />
        </section>);
}

export default function CommunityChannel(props) {
    const { channel, community, channelHandle } = props;

    const [files, setFiles] = useState([]);

    const [dragging, setDragging] = useState(false);

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    }

    const onDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    }

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        const { files: droppedFiles } = e.dataTransfer;

        if (!!droppedFiles && droppedFiles.length) {
            setFiles([...files, droppedFiles[0]]);
        }
    }

    if (!!channel && !!community) {
        return (
            <section
                className='wk-community-main'
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}>
                <div className='wk-channel-main'>
                    <ChannelHeader
                        channel={channel} />
                    <ChannelFeed
                        channelHandle={channelHandle}
                        channel={channel}
                        community={community}
                        dragging={dragging}
                        files={files}
                        setFiles={setFiles} />
                </div>
                <ChannelUsers
                    channel={channel}
                    community={community} />
            </section>
        );
    }

    return (
        <Flex p="4" direction="column" gap="4">
            <Heading>This channel doesnt exist 👀</Heading>
        </Flex>
    );
}
