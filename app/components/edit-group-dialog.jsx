import { Text, Flex, Dialog, TextField, Button, Callout } from '@radix-ui/themes';
import { useFetcher } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import { InfoCircledIcon } from '@radix-ui/react-icons';

export default function EditGroupDialog(props) {
    const { group, community, closeDialog } = props;

    const fetcher = useFetcher();

    const actionData = fetcher.data;

    const [name, setName] = useState(group?.name ?? "");
    const [valid, setValid] = useState(false);
    const [errors, setErrors] = useState(false);

    const isCreating = fetcher.state !== "idle";

    const handleEdit = useCallback(() => {
        if (!valid || !community) {
            return;
        }

        setErrors(null);

        const data = {
            __action: "edit_group",
            name: name,
            groupId: group?.id,
            communityHandle: community.handle,
        };

        fetcher.submit(data, { method: "post" });

    }, [name, valid, community]);

    useEffect(() => {
        setValid(false);
        setName(group?.name ?? "");
    }, [group]);

    useEffect(() => {
        setValid(name.length >= 3);
    }, [name]);

    useEffect(() => {
        if (!!(actionData?.id)) {
            closeDialog();
        }

        setErrors(actionData?.errors);
    }, [actionData]);

    return (
        <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Edit group</Dialog.Title>
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
                                handleEdit();
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
                <Button radius='full' disabled={!valid || isCreating} onClick={handleEdit}>Edit</Button>
            </Flex>
        </Dialog.Content>
    );
}
