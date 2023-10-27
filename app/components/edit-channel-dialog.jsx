import { Text, Flex, Dialog, TextField, Button, Callout } from '@radix-ui/themes';
import { useFetcher, useLocation } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import { InfoCircledIcon } from '@radix-ui/react-icons';

export default function EditChannelDialog(props) {
    const { group, channel, community, closeDialog } = props;

    const fetcher = useFetcher();
    const { pathname } = useLocation();

    const actionData = fetcher.data;

    const [name, setName] = useState(channel?.name ?? "");
    const [valid, setValid] = useState(false);
    const [errors, setErrors] = useState(false);

    const isCreating = fetcher.state !== "idle";

    const handleEditChannel = useCallback(() => {
        if (!valid  || !community) {
            return;
        }

        setErrors(null);

        const data = {
            __action: "edit_channel",
            name: name,
            groupId: group?.id,
            channelId: channel.id,
            channelHandle: channel.handle,
            communityHandle: community.handle,
        };

        fetcher.submit(data, { method: "post" });

    }, [name, group, valid, community]);

    useEffect(() => {
        setValid(false);
        setName(channel?.name ?? "");
    },[channel]);

    useEffect(() => {
        setValid(name.length >= 3);
    }, [name]);

    useEffect(() => {
        if (!!actionData?.errors) {
            return
        }
        setName("");
        closeDialog();
    }, [pathname, actionData]);

    useEffect(() => {
        setErrors(actionData?.errors);
    }, [actionData]);

    return (
        <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Edit channel</Dialog.Title>
            {!!group && <Dialog.Description size="2" mb="4">
                In {group.name}
            </Dialog.Description>}
            <Flex direction="column" gap="3">
            {!!errors && <Callout.Root color='red'>
                <Callout.Icon>
                    <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                    {errors[0].message}
                </Callout.Text>
            </Callout.Root>}
            <label>
                <Text as="div" size="2" mb="1" weight="bold">
                Name
                </Text>
                <TextField.Input
                    type='text'
                    value={name}
                    placeholder="Name of channel"
                    onKeyUp={(event) => {
                        if (event.key === "Enter" && !isCreating) {
                            handleEditChannel();
                        }
                    }}
                    onChange={(v) => {
                        setName(v.currentTarget.value);
                    }}
                />
            </label>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
                <Button radius='full' disabled={isCreating} variant="soft" color="gray">
                    Cancel
                </Button>
            </Dialog.Close>
            <Button radius='full' disabled={!valid || isCreating} onClick={handleEditChannel}>Edit</Button>
            </Flex>
        </Dialog.Content>
    );
}
