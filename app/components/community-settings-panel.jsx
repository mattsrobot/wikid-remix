import { Text, Box } from '@radix-ui/themes';
import { useLoaderData, Link, NavLink } from "@remix-run/react";
import { wkGhostButton } from './helpers.js';

import './styles.community-settings-panel.css';

export default function CommunitySettingsPanel() {
    const data = useLoaderData();
    const community = data.community;

    return (
        <nav className='wk-communities-settings-panel'>
            <Box p="4" className='wk-community-settings-description'>
                <Link aria-label="Community settings" to={`/c/${community.handle}`} className='rt-reset rt-BaseButton wk-community-settings-description-button'>
                    <Text weight="bold" size="3">{community.name}</Text>
                </Link>
            </Box>
            <Text weight="bold" size="2">Community Settings</Text>
            <NavLink aria-label="Community overview" className={`${wkGhostButton}`} data-accent-color="gray" to={`/s/${community.handle}/settings/overview`}>Overview</NavLink>
            <NavLink aria-label="Community roles" className={`${wkGhostButton}`} data-accent-color="gray" to={`/s/${community.handle}/settings/roles`}>Roles</NavLink>
            {community.server_owner && <NavLink aria-label="Community danger zone" className={`${wkGhostButton}`} data-accent-color="gray" to={`/s/${community.handle}/settings/danger-zone`}>Danger zone</NavLink>}
        </nav>
    );
}
