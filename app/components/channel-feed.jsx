import { useEffect, useRef, useState, useContext, useCallback } from 'react'
import { useFetcher } from "@remix-run/react";
import ChannelReplybox from "./channel-replybox";
import ChannelMessage from "./channel-message";
import ChannelMessageSkeleton from "./channel-message-skeleton";
import { useStateWithCallbackLazy } from "./feed-helpers";
import Prando from 'prando';
import WebsocketContext from './websocket-context';

import './styles.channel-feed.css';

const skeletonMessageHeight = 100;

export default function ChannelFeed(props) {
    const { channel, community, files, setFiles, dragging } = props;

    const { sendJsonMessage, lastJsonMessage } = useContext(WebsocketContext);

    const me = channel.user;

    const channelId = channel.id;

    const messagesFetcher = useFetcher({ key: `messages-${channelId}` });
    const channelFetcher = useFetcher({ key: `channel-${channelId}` });

    const [remainingMessages, setRemainingMessages] = useState(channel.remaining_messages);

    const shownSekeletons = Math.min(remainingMessages, 50);
    const moreRemaining = remainingMessages > 0;

    const [fetchingMore, setFetchingMore] = useState(false);
    const [page, setPage] = useState(0);

    const feedRef = useRef(null);
    const pageTops = useRef([]);
    const end = useRef(null);
    const gap = useRef(null);
    const [prevScrollTop, setPrevScrollTop] = useState(null);
    const [messages, setMessages] = useStateWithCallbackLazy([]);

    const [replyingTo, setReplyingTo] = useState(null);

    const handleNewSocketMessage = useCallback((newMessageJson) => {
        if (newMessageJson?.topic == channel.id) {
            try {
                const update = JSON.parse(newMessageJson.message);

                if (messages.length > 0) {

                    const idx = messages.map((m) => m.id).indexOf(update.id);

                    if (idx >= 0) {

                        let mp = [...messages];

                        mp[idx] = update;

                        setMessages(mp, () => {
                            if (update.user.handle == channel.user.handle) {
                                return
                            }
                            const feed = feedRef.current;
                            feed.scrollTop = feed.scrollHeight;
                        });
                    } else {
                        const last = messages[messages.length - 1];

                        if (last.user.handle !== channel.user.handle) {
                            setMessages([...messages, update], () => {
                                const feed = feedRef.current;
                                feed.scrollTop = feed.scrollHeight;
                            });
                        } else {
                            let mp = [...messages];
                            mp[messages.length - 1] = update;
                            setMessages(mp);
                        }
                    }
                } else {
                    setMessages([update], () => {
                        if (update.user.handle == channel.user.handle) {
                            return
                        }
                        const feed = feedRef.current;
                        feed.scrollTop = feed.scrollHeight;
                    });
                }
            } catch (e) {
                console.error("encountered an error json decoding");
            }
        }
    }, [messages, channel]);

    useEffect(() => {
        handleNewSocketMessage(lastJsonMessage);
    }, [lastJsonMessage]);

    const addMessageOptimistically = (data) => {
        let newMessages = [...messages];

        const { text, parentMessage, files, user, optimisticUuid } = data;

        if (newMessages.length > 0) {
            const idx = newMessages.length - 1;
            const last = newMessages[idx];

            if (last.user.handle == user.handle && !parentMessage && files.length == 0 && (!last.files || last.files.length == 0)) {
                newMessages[idx] = {
                    id: last.id,
                    optimistic: true,
                    optimisticUuid: optimisticUuid,
                    created_at: last.created_at,
                    updated_at: last.updated_at,
                    text: `${last.text}\n${text}`,
                    user: user,
                    reactions: last.reactions,
                    edited: last.edited,
                    parent: last.parent,
                    files: last.files,
                };
            } else {
                newMessages = [...messages, {
                    id: Date().toString(),
                    optimistic: true,
                    optimisticUuid: optimisticUuid,
                    text: text,
                    user: user,
                    reactions: {},
                    edited: false,
                    parent: parentMessage,
                    files: files,
                }];
            }
        } else {
            newMessages = [{
                id: Date().toString(),
                optimistic: true,
                optimisticUuid: optimisticUuid,
                text: text,
                user: user,
                reactions: {},
                edited: false,
                parent: parentMessage,
                files: files,
            }];
        }

        setMessages(newMessages, () => {
            const feed = feedRef.current;
            feed.scrollTop = feed.scrollHeight;
        });
    };

    useEffect(() => {
        if (!!channelId) {
            sendJsonMessage({ "type": "subscribe", "topic": channelId });
        }
    }, [channelId]);

    useEffect(() => {
        setReplyingTo(null);
        setPrevScrollTop(null);
        setPage(0);
        setRemainingMessages(channel.remaining_messages);
        setMessages(channel.messages, () => {
            const feed = feedRef.current;
            feed.scrollTop = feed.scrollHeight;
        });
    }, [channelId]);

    useEffect(() => {
        if (!fetchingMore) {
            return;
        }

        if (!messagesFetcher.data?.channel) {
            return
        }

        const [response] = messagesFetcher.data.channel;

        if (!!response?.messages) {

            const newMessages = response.messages;
            const remaining = response.remaining_messages;

            setRemainingMessages(remaining);

            setMessages((prev) => [...newMessages, ...prev], () => {
                if (!!pageTops.current && pageTops.current.length > 1) {
                    pageTops.current[1]?.scrollIntoView({ behavior: "instant" });
                }
            });

            setFetchingMore(false);
        }

    }, [messagesFetcher, fetchingMore]);

    useEffect(() => {
        const optimisticUuid = channelFetcher.data?.optimisticUuid;

        if (!optimisticUuid) {
            return
        }

        const response = channelFetcher.data;

        if (!!response?.id) {
            setMessages((prev) => {
                let i = 0;
                const update = [...prev];
                while (i < update.length) {
                    const msg = update[i];
                    if (msg.optimisticUuid == optimisticUuid) {
                        msg.optimistic = false;
                        msg.id = msg.id;
                        update[i] = msg;
                    }
                    i++;
                }
                return update;
            }, () => { });
        }

    }, [channelFetcher]);

    useEffect(() => {
        if (page == 0) {
            return;
        }

        const data = {
            __action: "fetch_more_messages",
            page: page + 1,
            communityHandle: community.handle,
            channelHandle: channel.handle,
        }

        messagesFetcher.submit(data, {
            method: "post",
        });

    }, [page]);

    return (
        <>
            <section ref={feedRef} onContextMenu={(e) => { e.preventDefault() }} className='wk-channel-feed' onScroll={_ => {

                const feed = feedRef.current;

                if (feed.scrollHeight <= feed.clientHeight) {
                    // Not scrollable.
                    return;
                }

                if (!moreRemaining) {
                    // There's no more messages
                    return;
                }

                const threshold = skeletonMessageHeight * shownSekeletons;
                const scrollPosition = feed.scrollTop;

                if (!prevScrollTop) {
                    setPrevScrollTop(scrollPosition);
                    return;
                }

                if (prevScrollTop < scrollPosition) {
                    return;
                }

                if (scrollPosition <= threshold && !fetchingMore) {
                    setFetchingMore(true);
                    setPage((v) => v + 1);
                }
            }}>
                {remainingMessages > 0 && Array.apply(null, { length: shownSekeletons }).map((_, i) => {
                    let rng = new Prando(i);
                    rng.skip(i);
                    let num = rng.nextInt(40, 100);
                    return (
                        <span key={`skeleteton-${i}`}>
                            <ChannelMessageSkeleton size={`${num}%`} />
                        </span>
                    );
                })}
                {messages.map((e, i) => {
                    const isEnd = i == (messages.length - 1);
                    const isReplyingTo = !!replyingTo;
                    if (i % 50 == 0) {
                        return (
                            <span ref={(ref) => pageTops.current[i / 50] = ref} key={`cm-${e.id}-${i}`}>
                                <ChannelMessage
                                    channel={channel}
                                    community={community}
                                    setReplyingTo={setReplyingTo}
                                    me={me}
                                    message={e} />
                            </span>
                        );
                    } else {
                        return (
                            <span key={`cm-${e.id}-${i}`} style={{paddingBottom:  isEnd ? isReplyingTo ? 50 : 20 : 0 }}>
                                <ChannelMessage
                                    channel={channel}
                                    community={community}
                                    setReplyingTo={setReplyingTo}
                                    me={me}
                                    message={e} />
                            </span>
                        );
                    }
                })}
                <div style={{ flexGrow: 1 }} ref={gap} />
                <span style={{ height: 1 }} ref={end} />
            </section>
            <div className="wk-blur-box">
                <ChannelReplybox
                    addMessageOptimistically={addMessageOptimistically}
                    community={community}
                    channel={channel}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    dragging={dragging}
                    files={files}
                    setFiles={setFiles}
                />
            </div>
        </>

    );
}
