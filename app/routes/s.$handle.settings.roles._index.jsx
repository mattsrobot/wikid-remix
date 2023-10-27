import { Flex, Text, Card, Table, Badge, IconButton } from '@radix-ui/themes';
import { json, redirect } from "@remix-run/node";
import { Pencil1Icon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { authorize } from "../sessions.server.js";
import { community, communityRoles, editRolesPriority } from '../wikid.server.js';
import { wkGhostButton } from '../components/helpers.js';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useCallback, useState, useRef, useEffect } from 'react'
import update from 'immutability-helper';

export const meta = () => {
    return [
        {
            title: "Wikid | community settings | roles"
        },
        {
            property: "og:title",
            content: "Wikid | community settings | roles",
        },
        {
            name: "description",
            content: "Where communities meet",
        },
    ];
};

export async function action({ request }) {
    const body = await request.formData();

    const jwt = await authorize(request);

    const action = body.get("__action");

    if (action == "edit_priorities") {

        const communityHandle = body.get("communityHandle");

        const roleIds = JSON.parse(body.get("roleIds"));

        const [_, errors] = await editRolesPriority(communityHandle, roleIds, jwt);

        if (!!errors) {
            return json({ errors: errors });
        }
    }

    return json({});
}

export const loader = async ({ request, params }) => {
    const jwt = await authorize(request);

    if (!jwt) {
        return redirect('/c/get-started');
    }

    const handle = params.handle;

    const v = await Promise.all([
        community(handle, jwt),
        communityRoles(handle, jwt)
    ]);

    const [communityData, errors] = v[0];
    const [rolesData] = v[1];

    if (communityData?.permissions?.manage_community == false) {
        return redirect(`/c/${handle}`);
    }

    return json(
        {
            handle: handle,
            community: communityData,
            roles: rolesData,
            errors: errors,
        }
    );
}

function RoleRow({ role, moveRole, id, index, community }) {
    const { name, members, color } = role;

    const ref = useRef(null);

    const [{ handlerId }, drop] = useDrop({
        accept: "role",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        hover(item, monitor) {
            if (!ref.current) {
                return
            }
            const dragIndex = item.index
            const hoverIndex = index
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect()
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            // Determine mouse position
            const clientOffset = monitor.getClientOffset()
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }
            // Time to actually perform the action
            moveRole(dragIndex, hoverIndex)
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex
        },
    });

    const [{ }, drag] = useDrag({
        type: "role",
        item: () => {
            return { id, index, role };
        },

        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <Table.Row ref={ref} className='wk-table-row wk-movable' data-handler-id={handlerId}>
            <Table.RowHeaderCell><Badge color={color}>{name}</Badge></Table.RowHeaderCell>
            <Table.Cell>{members}</Table.Cell>
            <Table.Cell>
                <Link to={`/s/${community.handle}/settings/roles/${id}`} className="rt-reset">
                    <IconButton aria-label="Edit role" radius="full" size="1">
                        <Pencil1Icon />
                    </IconButton>
                </Link>
            </Table.Cell>
        </Table.Row>
    );
}

export default function CommunitySettingsRoles() {
    const data = useLoaderData();

    const community = data.community;

    const rolesFetcher = useFetcher();

    const [roles, setRoles] = useState(data.roles);

    const moveRole = useCallback((dragIndex, hoverIndex) => {
        setRoles((prevRoles) => {
            const roles = update(prevRoles, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevRoles[dragIndex]],
                ],
            });

            const ids = roles.map(r => r.id);

            const data = {
                __action: "edit_priorities",
                communityHandle: community.handle,
                roleIds: JSON.stringify(ids),
            }

            rolesFetcher.submit(data, {method: "post"});

            return roles;
        });

    }, [roles, community]);

    return (
        <>
            <Flex direction="column" gap="0" className="wk-main-content">
                <nav className='wk-heading'>
                    <Text weight="bold">Roles</Text>
                </nav>
                <Flex p="4" gap="4" direction="column" className='wk-under-content'>
                    <Text size="2">Use roles to assign permissions to members of your community.</Text>
                    <Card className='wk-form-element wk-button-card'>
                        <Link   draggable="false" to={`/s/${community.handle}/settings/roles/default-permissions`} className='rt-reset'>
                            <Flex align="center" direction="row">
                                <Flex direction="column" gap="0">
                                    <Text size="2" weight="bold">Default Permissions</Text>
                                    <Text size="2">Applies to @everyone</Text>
                                </Flex>
                                <div style={{ flexGrow: 1 }} />
                                <ChevronRightIcon />
                            </Flex>
                        </Link>
                    </Card>
                    <Flex className="wk-form-element" direction="row" justify="end">
                        <Link draggable="false" preventScrollReset={true} to={`/s/${community.handle}/settings/roles/create`} className={wkGhostButton} data-radius="full">
                            Create role
                        </Link>
                    </Flex>
                    {roles.length > 0 ?
                        <DndProvider backend={HTML5Backend}>
                            <Table.Root className="wk-form-element" variant='surface'>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Members</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {roles.map((r, i) => <RoleRow key={`rr-${r.id}`} role={r} moveRole={moveRole} id={r.id} index={i} community={community} />)}
                                </Table.Body>
                            </Table.Root>
                        </DndProvider>
                        :
                        <Table.Root className="wk-form-element" variant='surface'>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell className='wk-align-center'>You don't have any roles.</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row className='wk-table-row wk-align-center'>
                                    <Table.RowHeaderCell>
                                        <Link draggable="false" preventScrollReset to={`/s/${community.handle}/settings/roles/create`} className={wkGhostButton} data-radius="full">
                                            Create role
                                        </Link>
                                    </Table.RowHeaderCell>
                                </Table.Row>
                            </Table.Body>
                        </Table.Root>}
                </Flex>
            </Flex>
        </>
    );
}
