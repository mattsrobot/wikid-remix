import { Text, Flex, Dialog, Button, Callout } from '@radix-ui/themes';
import { useFetcher } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import { InfoCircledIcon } from '@radix-ui/react-icons';

export default function ConfirmDeleteGroupDialog(props) {
    const { group, community, closeDialog } = props;

    const fetcher = useFetcher();

    const actionData = fetcher.data;

    const [errors, setErrors] = useState(false);

    const isBusy = fetcher.state !== "idle";

    const handleDelete = useCallback(() => {
        if (!community) {
            return;
        }

        setErrors(null);

        const data = {
            __action: "delete_group",
            groupId: group?.id,
            communityHandle: community.handle,
        };

        fetcher.submit(data, { method: "post" });

    }, [community, group]);

    useEffect(() => {
        if (!!(actionData?.ok)) {
            closeDialog();
        }

        setErrors(actionData?.errors);
    }, [actionData]);

    return (
        <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Confirm delete group</Dialog.Title>
            <Dialog.Description weight="strong">
                <Flex direction="column" gap="2">
                    <Text>Are you sure you want to delete this group?</Text>
                    <Text color='red'>Deleting this group will also delete all channels part of this group.</Text>
                </Flex>

            </Dialog.Description>
            <Flex direction="column" gap="3">
                {!!errors && <Callout.Root color='red'>
                    <Callout.Icon>
                        <InfoCircledIcon />
                    </Callout.Icon>
                    <Callout.Text>
                        {errors[0].message}
                    </Callout.Text>
                </Callout.Root>}
            </Flex>
            <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                    <Button radius='full' disabled={isBusy} variant="soft" color="gray">
                        Cancel
                    </Button>
                </Dialog.Close>
                <Button radius='full' color="red" disabled={isBusy} onClick={handleDelete}>Delete</Button>
            </Flex>
        </Dialog.Content>
    );
}
