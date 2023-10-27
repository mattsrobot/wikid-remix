import { Avatar, Text, Flex, ContextMenu, TextArea, Button, IconButton, Popover, ScrollArea, Theme } from '@radix-ui/themes';
import dayjs from 'dayjs';
import { friendlyName, avatarFallback } from "./helpers";
import { useState, useCallback, useEffect } from 'react';
import { ResetIcon, HeartFilledIcon, Pencil1Icon, FileIcon } from '@radix-ui/react-icons';
import { useFetcher } from "@remix-run/react";
import Twemoji from "./twemoji";
import { Image } from "@unpic/react";
import * as Dialog from '@radix-ui/react-dialog';
// import ReactPlayer from 'react-player';
// import { ClientOnly } from "remix-utils/client-only";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import JsFileDownloader from 'js-file-downloader';

import './styles.channel-message.css';

const emoji = ['\u{1F600}', '\u{1F606}', '\u{1F605}', '\u{1F929}', '\u{1F618}', '\u{1F60B}', '\u{1F614}', '\u{1F922}',
    '\u{1F975}', '\u{1F976}', '\u{1F974}', '\u{1F60E}', '\u{1F4AF}'];

function MessageParent(props) {
    const { parent } = props;

    const name = friendlyName(parent.user.name, parent.user.handle);
    const fb = avatarFallback(name);

    return (
        <Flex className='wk-parent-header' align="center" direction="row" gap="1">
            <Flex dir="row" gap="0" align="center">
                <div className='wk-repy-border'><div className='wk-reply-inner' /></div>
                {!!parent.user.avatar_url ?
                    <Image
                        className='wk-radius-full-size-1'
                        src={parent.user.avatar_url}
                        layout="constrained"
                        width={24}
                        height={24}
                        alt={parent.user.handle}
                    />
                    :
                    <Avatar
                        color="gray"
                        fallback={fb}
                        radius='full'
                        size="1" />}
            </Flex>
            <Text size="1" weight="bold" color={parent.user.powerful_role?.color}>@{parent.user.handle}</Text>
            <Text size="1" color='gray' className='wk-parent-reply-text'>{parent.text.replace(/(\r\n|\n|\r)/gm, " ")}</Text>
        </Flex>);
}

export default function ChannelMessage(props) {
    const { me, message, community, setReplyingTo } = props;

    const editMessageFetcher = useFetcher({ key: `edit-message-${community.handle}` });

    const name = friendlyName(message.user.name, message.user.handle);
    const fb = avatarFallback(name);
    const color = message.user?.powerful_role?.color;
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(editMessageFetcher.data?.text ?? message.text);
    const [edited, setEdited] = useState(!!editMessageFetcher.data?.text || message.edited);
    const [emojiReactions, setEmojiReactions] = useState(false);
    const [reactions, setReactions] = useState(message.reactions ?? {});
    const [files, setFiles] = useState(message.files ?? []);

    useEffect(() => {
        setText(message.text);
        setEdited(message.edited);
        setReactions(message.reactions ?? {});
        setFiles(message.files ?? []);
    }, [message]);

    const rk = Object.keys(reactions);

    const isMine = me?.handle == message.user.handle;

    const handleCopyText = useCallback(() => {
        if (typeof document !== "undefined") {

            let selectedText = "";

            if (window.getSelection) {
                selectedText = window.getSelection().toString();
            } else if (document.getSelection) {
                selectedText = document.getSelection().toString();
            } else if (document.selection) {
                selectedText = document.selection.createRange().text;
            }

            selectedText = selectedText?.trim();

            if (!selectedText || selectedText.length == 0) {
                selectedText = text;
            }

            navigator.clipboard.writeText(selectedText);
        }
    }, [text]);

    const handleEdit = useCallback(() => {
        setEditing(false);
        setEdited(true);
        const data = {
            __action: "edit_message",
            communityHandle: community.handle,
            messageId: message.id,
            text: text,
        };
        editMessageFetcher.submit(data, {
            method: "post",
        });
    }, [message, text, community]);

    const handleReact = useCallback((reaction) => {
        setEmojiReactions(false);

        const data = {
            __action: "react_to_message",
            communityHandle: community.handle,
            messageId: message.id,
            reaction: reaction,
        };
        editMessageFetcher.submit(data, {
            method: "post",
        });

        let f = reactions[reaction];

        if (f == null) {
            const m = {}

            m[reaction] = [{
                user_id: me.id,
                user_handle: me.handle
            }];

            setReactions({
                ...reactions,
                ...m,
            })
        } else {

            let adding = true;

            for (let i = 0; i < f.length; i++) {
                if (f[i].user_handle == me.handle) {
                    adding = false;
                }
            }

            const cp = { ...reactions };

            if (adding) {
                cp[reaction] = [...cp[reaction], {
                    user_id: me.id,
                    user_handle: me.handle
                }];
            } else {
                f.pop();

                if (f.length == 0) {
                    delete cp[reaction];
                } else {
                    cp[reaction] = f;
                }
            }

            setReactions(cp);
        }

    }, [message, reactions, community, me]);

    const handleUserKeyPress = useCallback(event => {
        const { key } = event;
        if (key === "Escape" && editing) {
            setEditing(false);
            setText(message.text);
        }
    }, [message, editing]);

    const handleReply = useCallback(() => {
        setReplyingTo({
            handle: message.user.handle,
            messageId: message.id,
            color: message.user?.powerful_role?.color,
            message: message
        });
    }, [message]);

    useEffect(() => {
        window.addEventListener("keydown", handleUserKeyPress);
        return () => {
            window.removeEventListener("keydown", handleUserKeyPress);
        };
    }, [handleUserKeyPress]);

    const type = ((message.parent?.user.handle == me?.handle) && !!me) ? "active" : "normal";

    const messageText =
        <Flex direction="column" gap="2">
            <section className='wk-channel-message' data-type={type}>
                <Popover.Root open={emojiReactions} onOpenChange={(e) => setEmojiReactions(false)} modal>
                    <Flex className='wk-reaction-bar' direction="row" align="center" gap="2">
                        {isMine && <IconButton aria-label="Edit message" color='gray' size="1" variant='ghost' onClick={() => setEditing(true)}><Pencil1Icon /></IconButton>}
                        <IconButton aria-label="Emoji react to" color='gray' size="1" variant='ghost' onClick={() => setEmojiReactions(true)}><HeartFilledIcon /></IconButton>
                        {!isMine && <IconButton aria-label="Reply to" color='gray' size="1" variant='ghost' onClick={handleReply}><ResetIcon /></IconButton>}
                    </Flex>
                    <Popover.Trigger>
                        <Flex direction="column" gap="0">
                            {!!message.parent && <MessageParent parent={message.parent} />}
                            <Flex className={!!message.parent ? "wk-parent-reply" : ""} direction="row" gap="4" align="start">
                                {!!message.user.avatar_url ?
                                    <Image
                                        className='wk-radius-full-size-3'
                                        src={message.user.avatar_url}
                                        layout="constrained"
                                        width={40}
                                        height={40}
                                        alt={message.user.handle}
                                    />
                                    :
                                    <Avatar
                                        color="gray"
                                        fallback={fb}
                                        radius='full'
                                        size="3" />}
                                <Flex direction="column" gap="0">
                                    <Flex direction="row" gap="1" wrap="wrap" m="0" p="0">
                                        <Text color={!!color ? color : undefined} size="1" weight="bold" style={{ display: "inline" }}>{name}</Text>
                                        <Text size="1" color='gray' style={{ display: "inline" }}>{dayjs(message.created_at).format('MM/DD/YYYY hh:mm A')}</Text>
                                    </Flex>
                                    {!!text && text.length > 0 && <Text size="2" className='wk-whitespace-pre wk-markdown'>
                                        <Markdown skipHtml remarkPlugins={remarkGfm}>
                                            {text}
                                        </Markdown>
                                    </Text>}
                                    {!!message.optimistic && <Text size="1" color='green'>
                                        sending
                                    </Text>}
                                    {edited && <Text size="1" color='gray'>
                                        edited
                                    </Text>}
                                    {files.length > 0 && <Flex pt="1" direction="column" gap="2">
                                        {files.map((e) => {
                                            if (e.mime_type.includes("video")) {
                                                return <Image className='wk-message-img' width={400} height={300} src={e.thumbnail_url} layout="constrained" alt={e.name} />;
                                            } else if (e.mime_type.includes("image")) {
                                                return <Dialog.Root className='rt-reset' key={`dialog-${e.id}`}>
                                                    <Dialog.Trigger className='rt-reset'>
                                                        <Image
                                                            className='wk-message-img'
                                                            src={e.thumbnail_url}
                                                            layout="constrained"
                                                            width={400}
                                                            height={300}
                                                            alt={e.name}
                                                        />
                                                    </Dialog.Trigger>
                                                    <Dialog.Portal>
                                                        <Dialog.Overlay className="wk-dialog-overlay" onContextMenu={(e) => { e.preventDefault() }} />
                                                        <Dialog.Content className='wk-dialog-content'>
                                                            <Theme style={{ height: "100%" }} grayColor="gray" panelBackground="translucent" hasBackground={false} scaling="100%">
                                                                <Flex direction="column" height="100%" gap="3">
                                                                    <ContextMenu.Root>
                                                                        <ContextMenu.Trigger>
                                                                            <Image
                                                                                className='wk-dialog-image-detail'
                                                                                src={e.url}
                                                                                layout="constrained"
                                                                                alt={e.name} />
                                                                        </ContextMenu.Trigger>
                                                                        <ContextMenu.Content>
                                                                            <ContextMenu.Item onSelect={() => {
                                                                                new JsFileDownloader({ url: e.url, filename: e.name })
                                                                            }}>Download</ContextMenu.Item>
                                                                        </ContextMenu.Content>
                                                                    </ContextMenu.Root>
                                                                    <Flex gap="3" justify="end">
                                                                        <Button radius='full' onClick={() => {
                                                                            new JsFileDownloader({ url: e.url, filename: e.name })
                                                                        }} variant="solid" color="gray">
                                                                            Download
                                                                        </Button>
                                                                        <Dialog.Close className='rt-reset'>
                                                                            <Button radius='full' variant="solid" color="gray" highContrast>
                                                                                Close
                                                                            </Button>
                                                                        </Dialog.Close>
                                                                    </Flex>
                                                                </Flex>
                                                            </Theme>
                                                        </Dialog.Content>
                                                    </Dialog.Portal>
                                                </Dialog.Root>;
                                            } else {
                                                return <Button onClick={() => {
                                                    new JsFileDownloader({ url: e.url, filename: e.name })
                                                }}>
                                                    {e.name} <FileIcon />
                                                </Button>;
                                            }
                                        })}
                                    </Flex>}
                                </Flex>
                            </Flex>
                        </Flex>
                    </Popover.Trigger>
                    <Popover.Content className="wk-emojis" side='top' sideOffset={-100} alignOffset={-18} align='start'>
                        <ScrollArea type="always" scrollbars="vertical" style={{ height: 100 }}>
                            <Flex gap="3" direction="row" wrap="wrap">
                                {emoji.map((e) => {
                                    return <Button key={`r-${message.id}-${e}`} onClick={() => handleReact(e)} size="2" variant='ghost' color="gray">
                                        <Twemoji emoji={e} />
                                    </Button>;
                                })}
                            </Flex>
                        </ScrollArea>
                    </Popover.Content>
                </Popover.Root>
            </section>
            {rk.length > 0 && <Flex pl="9" pt="1" direction="row" gap="2">
                {rk.map((e) => {
                    return <Button ml="2" className='wk-message-emoji' key={`m-${message.id}-${e}`} onClick={() => handleReact(e)} size="1" variant='ghost' color="gray">
                        {reactions[e].length}
                        <Twemoji emoji={e} />
                    </Button>;
                })}
            </Flex>}
        </Flex>
        ;

    const messageEditor =
        <section className='wk-channel-message'>
            <Flex direction="column" gap="1" pt="1" pb="1">
                <Flex direction="row" gap="4" align="start" className='wk-fullwidth'>
                    {!!message.user.avatar_url ?
                        <Image
                            className='wk-radius-full-size-3'
                            src={message.user.avatar_url}
                            layout="constrained"
                            width={40}
                            height={40}
                            alt={message.user.handle}
                        />
                        :
                        <Avatar
                            color="gray"
                            fallback={fb}
                            radius='full'
                            size="3" />}
                    <Flex direction="column" gap="1" className='wk-fullwidth'>
                        <Flex direction="row" gap="1" wrap="wrap" m="0" p="0">
                            <Text color={!!color ? color : undefined} size="1" weight="bold" style={{ display: "inline" }}>{name}</Text>
                            <Text size="1" color='gray' style={{ display: "inline" }}>{dayjs(message.created_at).format('MM/DD/YYYY hh:mm A')}</Text>
                        </Flex>
                        <TextArea className='wk-fullwidth' type='text' value={text} onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    handleEdit();
                                    return false;
                                }
                            }
                        }}
                            onChange={(v) => {
                                setText(v.currentTarget.value);
                            }}>
                        </TextArea>
                    </Flex>
                </Flex>
                <Flex direction="row" gap="4" ml="9" pt="1">
                    <Button radius='full' size="1" variant='ghost' onClick={handleEdit}>Save</Button>
                    <Button radius='full' size="1" variant='ghost' color="gray" onClick={() => setEditing(false)}>Cancel</Button>
                </Flex>
            </Flex>
        </section>;

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger>
                {editing ? messageEditor : messageText}
            </ContextMenu.Trigger>
            <ContextMenu.Content>
                <ContextMenu.Item onSelect={() => setEmojiReactions(true)}>Add reactions</ContextMenu.Item>
                {isMine ?
                    <>
                        <ContextMenu.Item onSelect={() => setEditing(true)}>Edit</ContextMenu.Item>
                        <ContextMenu.Item onSelect={handleCopyText}>Copy text</ContextMenu.Item>
                        <ContextMenu.Separator />
                        <ContextMenu.Item color="red">Delete message</ContextMenu.Item>
                    </> :
                    <>
                        <ContextMenu.Item onSelect={handleReply}>Reply to</ContextMenu.Item>
                        <ContextMenu.Item onSelect={handleCopyText}>Copy text</ContextMenu.Item>
                        <ContextMenu.Separator />
                        <ContextMenu.Item color="red">Report message</ContextMenu.Item>
                    </>
                }
            </ContextMenu.Content>
        </ContextMenu.Root>
    );
}
