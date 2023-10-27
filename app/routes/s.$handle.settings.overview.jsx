import { Flex, Text, TextField, Callout, Button, Box } from '@radix-ui/themes';
import { redirect, json } from "@remix-run/node";
import { authorize, sessionStorage } from "../sessions.server.js";
import { community, editCommunity } from "../wikid.server.js";
import { useCallback, useState, useEffect } from 'react';
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { InfoCircledIcon } from '@radix-ui/react-icons';

export const meta = () => {
    return [
        {
            title: "Wikid | community settings | overview"
        },
        {
            property: "og:title",
            content: "Wikid | community settings | overview",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export async function action({ request }) {
    const body = await request.formData();

    const jwt = await authorize(request);

    const action = body.get("__action");

    if (action == "edit_community") {

        const communityHandle = body.get("communityHandle");
        const input = body.get("input");

        const [_, errors] = await editCommunity(communityHandle, input, jwt);

        if (!!errors) {
            return json({ errors: errors });
        }

        const cookie = request.headers.get("Cookie");
        const session = await sessionStorage.getSession(cookie);

        session.flash("message", "Saved");

        throw redirect(`/s/${communityHandle}/settings/overview`, {
            headers: {
                "Set-Cookie": await sessionStorage.commitSession(session, {
                    maxAge: 60 * 60 * 24 * 30,
                }),
            },
        });
    }

    return json({});
}

export const loader = async ({ request, params }) => {
    const jwt = await authorize(request);

    if (!jwt) {
        return redirect('/c/get-started');
    }

    const handle = params.handle;

    const [data, errors] = await community(handle, jwt);

    if (data?.permissions?.manage_community == false) {
        return redirect(`/c/${handle}`);
    }

    return json({
        community: data,
        errors: errors
    });
}

export default function CommunitySettingsOverview() {

    const data = useLoaderData();
    const community = data.community;

    const navigation = useNavigation();
    const submit = useSubmit();
    const actionData = useActionData();

    const [name, setName] = useState(community.name);
    const [errors, setErrors] = useState(false);
    const isBusy = navigation.state !== "idle";

    const toggleSave = useCallback(() => {
        if (!community) {
            return;
        }

        const input = {
            name: name,
        };

        const communityHandle = community.handle;

        const data = {
            __action: "edit_community",
            input: JSON.stringify(input),
            communityHandle: communityHandle,
        };

        submit(data, { method: "post" });
    }, [community, name]);

    useEffect(() => {
        setErrors(actionData?.errors);
    }, [actionData]);

    return (
        <Flex direction="column" gap="0" className="wk-main-content">
            <nav className='wk-heading'>
                <Text weight="bold">Overview</Text>
            </nav>
            <Flex direction="column" gap="3" p="4" className='wk-under-content wk-form-element'>
                {!!errors && <Callout.Root color='red'>
                    <Callout.Icon>
                        <InfoCircledIcon />
                    </Callout.Icon>
                    <Callout.Text>
                        {errors[0].message}
                    </Callout.Text>
                </Callout.Root>}
                <Text size="2">Make changes to your community.</Text>
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        Name
                    </Text>
                    <TextField.Input
                        type='text'
                        value={name}
                        onChange={(v) => {
                            setName(v.currentTarget.value);
                        }}
                        placeholder="Community name"
                    />
                </label>
                <Box>
                    <Button radius='full' disabled={isBusy} onClick={toggleSave}>Save</Button>
                </Box>
            </Flex>
        </Flex>
    );
}
