import { Text, Flex, Dialog, TextField, Button, Callout } from '@radix-ui/themes';
import { useFetcher, useLocation } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import { InfoCircledIcon } from '@radix-ui/react-icons';

export default function CreateGroupDialog(props) {
    const { community, closeDialog } = props;

    const fetcher = useFetcher();

    const { pathname } = useLocation();

    const actionData = fetcher.data;

    const [name, setName] = useState("");
    const [valid, setValid] = useState(false);
    const [errors, setErrors] = useState(false);

    const isCreating = fetcher.state !== "idle";

    const handleCreateGroup = useCallback(() => {
        if (!valid || !community) {
            return;
        }

        setErrors(null);

        const data = {
            __action: "create_group",
            name: name,
            communityHandle: community.handle,
        };

        fetcher.submit(data, { method: "post" });

    }, [name, valid, community]);

    useEffect(() => {
        setValid(name.length >= 3);
    }, [name]);

    useEffect(() => {
        setName("");
        closeDialog();
    }, [pathname]);

    useEffect(() => {
        if (!!(actionData?.id)) {
            closeDialog();
        }

        setErrors(actionData?.errors);
    }, [actionData]);

    return (
        <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Create a group</Dialog.Title>
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
                        placeholder="Name of group"
                        onKeyUp={(event) => {
                            if (event.key === "Enter" && !isCreating) {
                                handleCreateGroup();
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
                <Button radius='full' disabled={!valid || isCreating} onClick={handleCreateGroup}>Create</Button>
            </Flex>
        </Dialog.Content>
    );
}
