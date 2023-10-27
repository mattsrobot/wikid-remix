import { Flex, Card, Heading } from '@radix-ui/themes';
import { json, redirect } from "@remix-run/node";
import { sessionStorage, USER_SESSION_KEY } from "../sessions.server.js";
import { useLoaderData } from "@remix-run/react";
import electron from "../electron.server.js"
import env from "../environment.server.js";

export const meta = () => {
    return [
        {
            title: "Wikid | authorization"
        },
        {
            property: "og:title",
            content: "Wikid | authorization",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export const loader = async ({request}) => {

    let jwt = null;

    if (env.electron) {
        jwt = electron.get(USER_SESSION_KEY);
    } else {
        const cookie = request.headers.get("Cookie");
        const session = await sessionStorage.getSession(cookie);
        jwt = session.get(USER_SESSION_KEY);
    }

    if (!!jwt) {
        return json({jwt: jwt})
    } else {
        return redirect("/login");
    }
}

export default function Authorize() {
    const data = useLoaderData();
    return (
        <Flex style={{ minHeight: "100vh" }} direction="column" align="center" justify="center">
            <Card style={{ maxWidth: 450, width: "100%" }} size="4">
                <Flex direction="column" gap="4">
                    <Heading>Authorization success {data.jwt}</Heading>
                </Flex>
            </Card>
        </Flex>
    );
}
