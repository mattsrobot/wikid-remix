import { json } from "@remix-run/node";

export const loader = async () => {
    return json({});
}

export const meta = () => {
    return [
        {
            title: "Wikid | community"
        },
        {
            property: "og:title",
            content: "Wikid | community",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export default function CommunityIndex() {
    return (
        <>
        </>
    );
}
