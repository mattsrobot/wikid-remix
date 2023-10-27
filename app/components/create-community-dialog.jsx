import { Text, Flex, Dialog, TextField, Button, RadioGroup, Link, Callout } from '@radix-ui/themes';
import { useSubmit, useActionData, useNavigation } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import { InfoCircledIcon } from '@radix-ui/react-icons';

export default function CreateCommunityDialog() {
    const navigation = useNavigation();
    const actionData = useActionData();
    const submit = useSubmit();

    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");
    const [type, setType] = useState("public");

    const [valid, setValid] = useState(false);
    const [errors, setErrors] = useState(false);

    const handleCreateCommmunity = useCallback(() => {
        if (!valid) {
            return;
        }

        setErrors(null);

        const data = {
            __action: "create_community",
            name: name,
            handle: handle,
            private: type == "private",
        };

        submit(data, { method: "post" });

    }, [name, handle, type, valid]);

    useEffect(() => {
        setValid(name.length >= 3 && handle.length >= 3);
    }, [name, handle]);

    useEffect(() => {
        setErrors(actionData?.errors);
    }, [actionData]);

    return (
        <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Create a community</Dialog.Title>
            <Dialog.Description size="2" mb="4">
                This is the start of something awesome. 🎉
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
            <label>
                <Text as="div" size="2" mb="1" weight="bold">
                Name
                </Text>
                <TextField.Input
                    type='text'
                    value={name}
                    placeholder="Name of community"
                    onChange={(v) => {
                        setName(v.currentTarget.value);
                    }}
                />
            </label>
            <label>
                <Text as="div" size="2" mb="1" weight="bold">
                    Who can join
                </Text>
                <RadioGroup.Root defaultValue="private" value={type} onValueChange={(v) => {
                    setType(v);
                }}>
                    <Flex gap="2" direction="column">
                        <Text as="label" size="2">
                        <Flex gap="2">
                            <RadioGroup.Item value="public" /> Anyone can join (with controls)
                        </Flex>
                        </Text>
                        <Text as="label" size="2">
                        <Flex gap="2">
                            <RadioGroup.Item value="private" /> Invite only
                        </Flex>
                        </Text>
                    </Flex>
                </RadioGroup.Root>
            </label>
            <label>
                <Flex direction="column" mb="1" gap="1">
                    <Text as="div" size="2" weight="bold">
                    Community URL
                    </Text>
                    <Text size="2">
                        Your community will be available at:
                    </Text>
                    <Link size="2">
                        {`https://wikid.app/c/${handle.length > 0 ? handle : "unique-name" }`}
                    </Link>
                </Flex>
                <TextField.Input
                    type='text'
                    value={handle}
                    defaultValue=""
                    placeholder="unique-name"
                    onKeyUp={(event) => {
                        if (event.key === "Enter" && navigation.state != "submitting") {
                            handleCreateCommmunity();
                        }
                    }}
                    onChange={(v) => {
                        setHandle(v.currentTarget.value.toLowerCase().replace(/[^a-z-]/gi, ''));
                    }}
                />
                <Text size="1" color='gray'>
                Lowercase letters and - only.
                </Text>
            </label>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
                <Button radius='full' disabled={navigation.state == "submitting"} variant="soft" color="gray">
                    Cancel
                </Button>
            </Dialog.Close>
            <Button radius='full' disabled={!valid || navigation.state == "submitting"} onClick={handleCreateCommmunity}>Create</Button>
            </Flex>
        </Dialog.Content>
    );
}
