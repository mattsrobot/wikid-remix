import { Flex, Card, Heading, Text, Strong } from '@radix-ui/themes';

export const meta = () => {
    return [
        {
            title: "Wikid | join beta"
        },
        {
            property: "og:title",
            content: "Wikid | join beta",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export default function JoinedBeta() {
    return (
        <Flex style={{ minHeight: "100vh" }} direction="column" align="center" justify="center">
            <Card style={{ maxWidth: 450, width: "100%" }} size="4">
                <Flex direction="column" gap="2">
                    <Heading>Welcome to Wikid 🎉</Heading>
                    <Text color="purple"><Strong >Awesome</Strong></Text>
                    <Text>You'll get an email when we launch the beta test.</Text>
                    <Text>Invite your friends too!!</Text>
                </Flex>
            </Card>
        </Flex>
    );
}
