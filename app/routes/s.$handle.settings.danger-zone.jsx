import { Flex, Text, Checkbox, Button } from '@radix-ui/themes';
import { redirect, json } from "@remix-run/node";
import { authorize } from "../sessions.server.js";
import { useSubmit, useNavigation, useActionData, useLoaderData } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import { deleteCommunity } from '../wikid.server.js';

export const meta = () => {
    return [
        {
            title: "Wikid | community settings | danger zone"
        },
        {
            property: "og:title",
            content: "Wikid | community settings | danger zone",
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

    if (action == "delete_community") {

        const communityHandle = body.get("communityHandle");

        const [_, errors] = await deleteCommunity(communityHandle, jwt);

        if (!!errors) {
            return json({ errors: errors });
        }

        throw redirect('/c/get-started');
    }

    return json({});
}

export const loader = async ({ request, params }) => {
    const jwt = await authorize(request);

    if (!jwt) {
        return redirect('/c/get-started');
    }

    const handle = params.handle;

    return json({handle: handle});
}

export default function CommunitySettingsDangeZone() {

    const data = useLoaderData();

    const communityHandle = data.handle;

    const navigation = useNavigation();
    const submit = useSubmit();
    const actionData = useActionData();

    const [understood, setUnderstood] = useState(false);

    const [errors, setErrors] = useState(false);

    const toggleUnderstood = useCallback(() => {
        setUnderstood(v => !v);
    }, []);

    const toggleDeleteRole = useCallback(() => {
        const data = {
            __action: "delete_community",
            communityHandle: communityHandle,
        };

        submit(data, { method: "post" });
    }, [communityHandle]);

    const isBusy = navigation.state !== "idle";

    useEffect(() => {
        setErrors(actionData?.errors);
    }, [actionData]);

    return (
        <Flex direction="column" gap="0" className="wk-main-content">
            <nav className='wk-heading'>
                <Text weight="bold">Danger zone</Text>
            </nav>
            <Flex direction="column" className='wk-under-content'>
                <Flex direction="column" gap="3" p="4" pb="9">
                    <Text size="2" weight="bold">Delete community</Text>
                    <Text size="2">This is a permanent action.</Text>
                    <Text size="2" color='red'>All community data will be removed.</Text>
                    <Text as="label" size="2">
                        <Flex gap="2">
                            <Checkbox aria-label='I understand' checked={understood} onCheckedChange={toggleUnderstood} /> I understand
                        </Flex>
                    </Text>
                    <div>
                        <Button radius='full' disabled={!understood || isBusy} color='red' onClick={toggleDeleteRole}>Delete community</Button>
                    </div>
                </Flex>
            </Flex>
        </Flex>
    );
}
