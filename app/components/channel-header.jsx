import { Flex, Text, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

import './styles.channel-header.css';

export default function ChannelHeader(props) {
    const { channel } = props;
    return (
        <section className='wk-channel-header' onContextMenu={(e) => {e.preventDefault() }}>
            <Flex direction="row" justify="between" className='wk-fullwidth'>
                <Text weight="bold" size="3">{channel.name}</Text>
                <div style={{flexGrow: 1}} />
                <TextField.Root size="1" className='wk-searchbar' radius="full">
                    <TextField.Slot>
                        <MagnifyingGlassIcon height="16" width="16" />
                    </TextField.Slot>
                    <TextField.Input placeholder='Search'>

                    </TextField.Input>
                </TextField.Root>
            </Flex>
        </section>
    );
}
