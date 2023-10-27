import { IconButton, Text, TextArea, Flex, Button } from '@radix-ui/themes';
import { useFetcher } from "@remix-run/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { CrossCircledIcon, CameraIcon, TrashIcon, FileIcon, PlusIcon } from '@radix-ui/react-icons';
import { Image } from "@unpic/react";
import useAutosizeTextArea from './useAutosizeTextArea';
import './styles.channel-replybox.css';
import { v4 as uuidv4 } from 'uuid';

function getVideoCover(file, seekTo = 0.0) {
    return new Promise((resolve, reject) => {
        const videoPlayer = document.createElement('video');
        videoPlayer.setAttribute('src', URL.createObjectURL(file));
        videoPlayer.load();
        videoPlayer.addEventListener('error', (ex) => {
            reject("error when loading video file", ex);
        });
        videoPlayer.addEventListener('loadedmetadata', () => {
            if (videoPlayer.duration < seekTo) {
                reject("video is too short.");
                return;
            }
            setTimeout(() => {
                videoPlayer.currentTime = seekTo;
            }, 200);
            videoPlayer.addEventListener('seeked', () => {
                const canvas = document.createElement("canvas");
                canvas.width = videoPlayer.videoWidth;
                canvas.height = videoPlayer.videoHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                ctx.canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.75);
            });
        });
    });
}

export default function ChannelReplybox(props) {

    const { channel, community, replyingTo, setReplyingTo, files, setFiles, dragging, addMessageOptimistically } = props;

    const [filePreviews, setFilePreviews] = useState([]);

    const [text, setText] = useState("");
    const channelFetcher = useFetcher({ key: `channel-${channel.id}` });

    const [rows, setRows] = useState(1);
    const hiddenFileInput = useRef(null);

    const textAreaRef = useRef(null);

    useAutosizeTextArea(textAreaRef.current, text);

    const canMessage = community?.permissions?.send_messages ?? false;

    const restoreDefaults = () => {
        setFiles([]);
        setRows(1);
        setText("");
    }

    const handleCreateMessage = useCallback(() => {
        const trimmed = text.trim();

        if ((trimmed.length == 0 && files.length == 0) || !community) {
            setText("");
            return;
        }

        const form = new FormData();

        form.append("__action", "create_message");

        const optimisticUuid =  uuidv4();

        form.append("optimisticUuid", optimisticUuid);

        const localFiles = files.map(f => {
            return {
                name: f.name,
                mime_type: f.type,
                thumbnail_url: URL.createObjectURL(f),
                url: URL.createObjectURL(f)
            }
        });

        form.append('input', JSON.stringify({
            text: trimmed,
            channelId: channel.id,
            communityHandle: community.handle,
            parentId: replyingTo?.messageId,
            parentMessage: replyingTo?.message,
            localFiles: localFiles,
        }));

        for (var file of files) {
            form.append('files', file);
        }

        setReplyingTo(null);

        channelFetcher.submit(form, {
            encType: "multipart/form-data",
            action: "/z/create-message",
            method: "post",
            navigate: false,
            fetcherKey: `channel-${channel.id}`
        });

        addMessageOptimistically({
            user: channel.user,
            text: trimmed,
            channelId: channel.id,
            communityHandle: community.handle,
            parentId: replyingTo?.messageId,
            parentMessage: replyingTo?.message,
            files: localFiles ?? [],
            optimisticUuid: optimisticUuid,
        })

        restoreDefaults();
    }, [text, channel, community, replyingTo, files]);

    const handleCancelReply = useCallback(() => {
        setReplyingTo(null);
    }, []);

    const handleClickFileUpload = useCallback(() => {
        hiddenFileInput.current.click();
    }, []);

    const handleFilePick = useCallback(async (event) => {
        setFiles([...event.target.files]);
    }, []);

    const removeFile = useCallback((file) => {
        const cp = [...files].filter(x => x.name != file.name);
        setFiles(cp);
    }, [files, setFiles]);

    useEffect(() => {
        if (text.length == 0 && rows != 3) {
            setRows(1);
        }
    }, [text, rows]);

    useEffect(() => {

        const mapped = files.map((file) => new Promise((resolve, reject) => {
            if (file.type.includes("image/")) {
                resolve({ name: file.name, url: URL.createObjectURL(file) })
            } else if (file.type.includes("video/")) {
                getVideoCover(file, 0.0)
                    .then((image) => resolve({ name: file.name, url: URL.createObjectURL(image) }))
                    .catch(() => reject("Couldn't generate thumbnail for video"))
            } else {
                resolve({ name: file.name })
            }
        })
        );

        Promise.all(mapped).then((r) => setFilePreviews(r));

    }, [files]);

    return (
        <Flex direction="column" gap="2" className='wk-reply-container'>
            {(filePreviews.length > 0 || dragging) && <Flex direction="row" gap="2" className='wk-files-row'>
                {dragging && <Text size="2" color='green'>Drop your files to attach</Text>}
                {filePreviews.map((file) => {
                    if (!!file.url) {
                        return <div key={file.name} className='wk-reply-image-container'>
                            <IconButton onClick={() => removeFile(file)} radius="medium" color='red' className='wk-reply-image-remove' aria-label="Remove attachment">
                                <TrashIcon />
                            </IconButton>
                            <Image
                                layout='fullWidth'
                                height={100}
                                className='wk-reply-image-preview'
                                alt={file.name}
                                src={file.url} />
                        </div>;
                    }
                    return <div key={file.name} className='wk-reply-image-container'>
                        <IconButton onClick={() => removeFile(file)} radius="medium" color='red' className='wk-reply-image-remove' aria-label="Remove attachment">
                            <TrashIcon />
                        </IconButton>
                        <Button>
                            {file.name} <FileIcon />
                        </Button>
                    </div>;
                })}
            </Flex>}
            <section className='wk-channel-replybox'>
                {!!replyingTo && <section className='wk-reply-to'>
                    <Text size="1">Replying to</Text>
                    <Text size="2" color={replyingTo.color} weight="bold">@{replyingTo.handle}</Text>
                    <span style={{ flexGrow: 1, height: 0, backgroundColor: "transparent" }} />
                    <IconButton onClick={handleCancelReply} radius='full' size="2" variant='ghost' color='gray' aria-label="Cancel reply"><CrossCircledIcon /></IconButton>
                </section>}
                <IconButton className='wk-plus-button' onClick={handleClickFileUpload} radius='full' size="1" variant='ghost' color='gray' aria-label="Add attachment">
                    <PlusIcon color='var(--gray-11)' />
                </IconButton>
                <TextArea
                    ref={textAreaRef}
                    size="2"
                    className='wk-reply-box-inner'
                    rows={rows}
                    disabled={!canMessage}
                    value={text}
                    placeholder='Write something...'
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (e.shiftKey) {
                                setRows((v) => Math.min(v + 1, 8));
                            } else {
                                e.preventDefault();
                                handleCreateMessage();
                            }
                        }
                    }}
                    onChange={(e) => {
                        setText(e.currentTarget.value);
                    }}>
                </TextArea>
                <input
                    type="file"
                    multiple
                    onChange={handleFilePick}
                    ref={hiddenFileInput}
                    style={{ display: "none" }}
                />
            </section>
        </Flex>
    );
}
