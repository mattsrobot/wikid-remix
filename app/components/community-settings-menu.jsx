import { useLoaderData } from "@remix-run/react";
import CommunitySettingsPanel from './community-settings-panel.jsx';

import './styles.user-menu.css';

export default function CommunitySettingsMenu() {

    const data = useLoaderData();
    const me = data.me;
    const community = data?.community;

    return (
        <nav className="wk-community-nav">
            <CommunitySettingsPanel
                me={me}
                community={community} />
        </nav>
    );
}
