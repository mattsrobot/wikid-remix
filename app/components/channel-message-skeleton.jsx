import { Avatar, Text, Flex } from '@radix-ui/themes';

import './styles.channel-message-skeleton.css';
import './styles.channel-message.css';

export default function ChannelMessageSkeleton(props) {
    const { size } = props;
    return (
        <section className='wk-channel-message wk-skeleton'>
            <Flex direction="row" gap="4" align="start">
                <Avatar color="gray" fallback=" " radius='full' size="3" />
                <Flex direction="column" gap="2" width="100%">
                    <Flex direction="row" gap="1" m="0" p="0">
                        <Text color="gray" size="1" weight="bold" style={{
                            display: "inline",
                            width: `20%`,
                            borderRadius: "var(--radius-2)"
                        }}>&nbsp;</Text>
                    </Flex>
                    <Text size="2" style={{
                        width: size,
                        borderRadius: "var(--radius-2)"
                    }}>
                        &nbsp;
                    </Text>
                </Flex>
            </Flex>
        </section>
    );
}
