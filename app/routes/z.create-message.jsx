import { json, redirect, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData, unstable_createFileUploadHandler, } from "@remix-run/node";
import { createMessage, editProfilePicture } from "../wikid.server.js";
import { authorize } from "../sessions.server.js";

export async function action({ request }) {

    const uploadHandler = unstable_composeUploadHandlers(
        unstable_createFileUploadHandler({
          maxPartSize: 200_000_000,
          file: ({ filename }) => filename,
        }),
        unstable_createMemoryUploadHandler()
      );

    const body = await unstable_parseMultipartFormData(request, uploadHandler);

    const jwt = await authorize(request);

    if (!jwt) {
        throw redirect("/login");
    }

    const type = body.get("__action");

    if (type == "create_message") {

        const files = body.get("files");

        const input = JSON.parse(body.get("input"));
        const optimisticUuid = body.get("optimisticUuid");

        const { communityHandle, channelId, text, parentId } = input;

        const [response, errors] = await createMessage(communityHandle, channelId, text, parentId, files, jwt);

        if (!!errors) {
            return json({ optimisticUuid: optimisticUuid, errors: errors });
        }

        if (!!response?.id) {
            return json({ optimisticUuid: optimisticUuid, ...response, });
        }
    } if (type == "update_profile_pic") {
        const file = body.get("file");

        const [_, errors] = await editProfilePicture(file, jwt);

        if (!!errors) {
            return json({ errors: errors });
        }

        return json({ updated: true });
    }

    return json({});
}
