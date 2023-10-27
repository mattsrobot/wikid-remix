import { Flex, Card, Heading } from '@radix-ui/themes';
import { redirect } from "@remix-run/node";
import { sessionStorage, USER_SESSION_KEY } from "../sessions.server.js";

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
    const url = new URL(request.url);
    const jwt = url.searchParams.get('jwt');
    if (!!jwt) {
        const cookie = request.headers.get("Cookie");
        const session = await sessionStorage.getSession(cookie);
        session.set(USER_SESSION_KEY, jwt);
        return redirect("/authorize-success", {
            headers: { "Set-Cookie": await sessionStorage.commitSession(session, {
                maxAge: 60 * 60 * 24 * 30,
              }),
            },
          });
    } else {
        return redirect('/login');
    }
}

export default function Authorize() {
    return (
        <Flex style={{ minHeight: "100vh" }} direction="column" align="center" justify="center">
            <Card style={{ maxWidth: 450, width: "100%" }} size="4">
                <Flex direction="column" gap="4">
                    <Heading>Authorizing...</Heading>
                </Flex>
            </Card>
        </Flex>
    );
}
