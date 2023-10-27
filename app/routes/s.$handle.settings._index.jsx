import { redirect } from "@remix-run/node";
import { authorize } from "../sessions.server.js";

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

export const loader = async ({request, params}) => {
    const jwt = await authorize(request);

    if (!jwt) {
        return redirect('/c/get-started');
    }

    const handle = params.handle;

    return redirect(`/s/${handle}/settings/overview`);
}

export default function CommunitySettings() {
    return (<></>);
}
