import { Text, Flex, Dialog, Button, Callout, Checkbox, TextField, IconButton } from '@radix-ui/themes';
import { useFetcher, useLocation } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import { InfoCircledIcon, ClipboardCopyIcon } from '@radix-ui/react-icons';

export default function CreateInviteDialog(props) {
    const { open, community, webUrl } = props;

    const fetcher = useFetcher();
    const inviteFetcher = useFetcher();
    const code = inviteFetcher.data?.invite;

    const fetcherErrors = fetcher.data?.errors || inviteFetcher.data?.errors;

    // Display
    const [name, setName] = useState("");
    const [expiresOnUse, setExpiresOnUse] = useState(false);

    // Validation
    const [errors, setErrors] = useState(false);
    const isCreating = fetcher.state !== "idle";

    const toggleExpiresOnUse = useCallback((changed) => {
        setExpiresOnUse(changed);
    }, []);

    const copyToClipBoard = useCallback(() => {
        navigator.clipboard.writeText(`${webUrl}/c/invite?code=${code}`);
    }, [code]);

    const handleCreateInvite = useCallback(() => {
        const data = {
            __action: "create_invite",
            communityHandle: community.handle,
            expiresOnUse: expiresOnUse,
        }
        inviteFetcher.submit(data, { method: "post" });
    }, [community.handle, expiresOnUse, inviteFetcher]);

    useEffect(() => {
        setErrors(fetcherErrors);
    }, [fetcherErrors]);

    useEffect(() => {
        if (!open) {
            return;
        }
        handleCreateInvite();
    }, [community.handle, expiresOnUse, open]);

    return (
        <Dialog.Content style={{ maxWidth: 450, maxHeight: 600 }}>
            <Dialog.Title>Invite people</Dialog.Title>
            <Dialog.Description>Share with friends this link and invite them to your community.</Dialog.Description>
            <Flex direction="column" gap="3" pt="3" className='wk-fullwidth'>
                {!!errors && <Callout.Root color='red'>
                    <Callout.Icon>
                        <InfoCircledIcon />
                    </Callout.Icon>
                    <Callout.Text>
                        {errors[0].message}
                    </Callout.Text>
                </Callout.Root>}
                <Flex direction="row" gap="2" align="center" className='wk-fullwidth'>
                    <TextField.Root className='wk-fullwidth'>
                        <TextField.Input
                            onSelect={copyToClipBoard}
                            disabled
                            type='text'
                            value={`${webUrl}/c/invite?code=${code}`}
                            placeholder=""
                            onChange={(v) => {
                                setName(v.currentTarget.value);
                            }}
                        />
                        <TextField.Slot>
                            <IconButton aria-label="Copy invite to clipboard" size="1" variant="ghost" onClick={copyToClipBoard}>
                                <ClipboardCopyIcon height="14" width="14" />
                            </IconButton>
                        </TextField.Slot>
                    </TextField.Root>
                    <Button radius='full' disabled={isCreating} onClick={handleCreateInvite}>Create link</Button>
                </Flex>
                <Flex direction="row" gap="2" align="center">
                    <Text as="label" size="2">
                        <Flex gap="2">
                            <Checkbox aria-label='I understand' checked={expiresOnUse} onCheckedChange={toggleExpiresOnUse} /> Expires on use
                        </Flex>
                    </Text>
                </Flex>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                    <Button radius='full' disabled={isCreating} variant="soft" color="gray">
                        Close
                    </Button>
                </Dialog.Close>
            </Flex>
        </Dialog.Content>
    );
}
