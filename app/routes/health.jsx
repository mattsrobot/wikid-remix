import { Flex, Card, Heading } from '@radix-ui/themes';

export const meta = () => {
    return [
        {
            title: "Wikid | health check"
        },
        {
            property: "og:title",
            content: "Wikid | health check",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export default function HealthCheck() {
    return (
        <Flex style={{ minHeight: "100vh" }} direction="column" align="center" justify="center">
            <Card style={{ maxWidth: 450, width: "100%" }} size="4">
                <Flex direction="column" align="center" gap="4">
                    <Heading color='purple'>💖 I'm Healthy 👨🏼‍⚕️</Heading>
                    <Heading color='amber'>Woop</Heading>
                </Flex>
            </Card>
        </Flex>
    );
}
