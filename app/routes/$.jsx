import { Text, Flex, Link } from '@radix-ui/themes';

export default function NotFound() {
    return <Flex direction="column" align="center" justify="center" mt="9" gap="4">
        <Text pt="100">💀 This page doesn't exist 🎃</Text>
        <Link href='/u'>Return home</Link>
    </Flex>;
}
