import { Flex, Text, Button, Box } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { useHydrated } from "remix-utils/use-hydrated";

export default function ContextSaveToolbar(props) {

    const { hasChanges, save, discard } = props;

    const isHydrated = useHydrated();

    if (!isHydrated) {
        return null;
    }

    return (
        <motion.div
            initial="initial"
            animate={hasChanges ? "animate" : "initial"}
            variants={{
                initial: { opacity: 0.0, y: -100 },
                animate: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        delay: 0.1
                    }
                }
            }}
        >
            <nav className='wk-toolbar'>
                <Box pl="1">
                    <Text size="2" weight="bold">You have unsaved changes</Text>
                </Box>
                <div style={{ flexGrow: 1 }} />
                <Flex gap="4" direction="row" align="center">
                    <Button radius='full' color='gray' variant="ghost" onClick={discard}>Discard</Button>
                    <Button radius='full' onClick={save}>Save</Button>
                </Flex>
            </nav>
        </motion.div>
    );
}
