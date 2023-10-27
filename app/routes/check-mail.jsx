import { Flex, Card, Heading, Text } from '@radix-ui/themes';

export const meta = () => {
    return [
        {
            title: "Wikid | check your mail"
        },
        {
            property: "og:title",
            content: "Wikid | check your mail",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export default function Authorize() {
    return (
        <Flex style={{ minHeight: "100vh" }} direction="column" align="center" justify="center">
            <Card style={{ maxWidth: 450, width: "100%" }} size="4">
                <Flex direction="column" gap="4">
                    <Heading>Check your mail</Heading>
                    <Text>We've sent you a magic link to login.</Text>
                </Flex>
            </Card>
        </Flex>
    );
}
