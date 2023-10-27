import axios from 'axios';
import env from "./environment.server.js";
import { redirect } from '@remix-run/node';

const standardHeaders = {
  'X-Wikid-Header': env.wikidHeader,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const multipartHeaders = {
  'X-Wikid-Header': env.wikidHeader,
  'Content-Type': 'multipart/form-data',
  'Accept': 'application/json'
};

export const UNABLE_TO_CONNECT_ERROR_MESSAGE = "Unable to connect. Check internet.";
export const UNEXPECTED_ERROR_MESSAGE = "An unexpected error occurred.";
export const UNAUTHORIZED = "Must be logged in.";

/*
  AUTH API
*/

export const joinBeta = async (request) => {
  let errors = null;
  let response = null;

  try {
    const { data } = await axios({
      method: 'post',
      url: `${env.writeHotUrl}/auth/join_beta`,
      headers: standardHeaders,
      timeout: 15_000,
      data: request.input,
    });
    response = data;
    errors = data?.errors;
  } catch (error) {
    console.error(error);

    if (error.response) {
      if (!!error.response.data.errors) {
        errors = { errors: error.response.data.errors };
      } else {
        errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
      }
    } else if (error.request) {
      errors = { errors: [{ message: UNABLE_TO_CONNECT_ERROR_MESSAGE }] };
    } else {
      errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
    }
  }

  return [response, errors];
}

export const signUp = async (request) => {
  const input = request.input;

  let errors = null;
  let response = null;
  let status = 200;

  try {
    const { data, status: s } = await axios({
      method: 'post',
      url: `${env.writeHotUrl}/auth/sign_up`,
      headers: standardHeaders,
      timeout: 15_000,
      data: input,
    });
    response = data;
    status = s;
    errors = data?.errors;
  } catch (error) {
    console.error(error);

    if (error.response) {
      if (!!error.response.errors) {
        errors = { errors: error.response.errors };
      } else {
        errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
      }
    } else if (error.request) {
      errors = { errors: [{ message: UNABLE_TO_CONNECT_ERROR_MESSAGE }] };
    } else {
      errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
    }
  }

  return [response, errors, status];
}

export const signIn = async (request) => {
  const input = request.input;

  let errors = null;
  let response = null;
  let status = 200;

  try {
    const { data, status: s } = await axios({
      method: 'post',
      url: `${env.writeHotUrl}/auth/sign_in`,
      headers: standardHeaders,
      timeout: 15_000,
      data: input,
    });
    response = data;
    errors = data?.errors;
    status = s;
  } catch (error) {
    console.error(error);

    if (error.response) {
      status = error.response.status;

      if (!!error.response.data.errors) {
        errors = { errors: error.response.data.errors };
      } else {
        errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
      }
    } else if (error.request) {
      errors = { errors: [{ message: UNABLE_TO_CONNECT_ERROR_MESSAGE }] };
    } else {
      errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
    }
  }

  return [response, errors, status];
}

export const me = async (jwt) => {
  let errors = null;
  let response = null;
  let status = 200;

  const authHeaders = {
    "Authorization": `Bearer ${jwt}`,
  };

  const headers = {
    ...authHeaders,
    ...standardHeaders,
  }

  try {
    const { data, status: s } = await axios({
      method: 'get',
      url: `${env.readHotUrl}/me`,
      headers: headers,
      timeout: 15_000,
    });
    response = data;
    errors = data?.errors;
    status = s;
  } catch (error) {
    console.error(error);

    if (error.response) {
      status = error.response.status;

      if (!!error.response.errors) {
        errors = { errors: error.response.errors };
      } else {
        errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
      }
    } else if (error.request) {
      errors = { errors: [{ message: UNABLE_TO_CONNECT_ERROR_MESSAGE }] };
    } else {
      errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
    }
  }

  return [response, errors, status];
}

export const updateProfile = async (name, handle, about, jwt) => {

  if (!jwt) {
    return [null, { errors: [{ message: UNAUTHORIZED }] }, 401];
  }

  let errors = null;
  let response = null;
  let status = 200;

  const authHeaders = {
    "Authorization": `Bearer ${jwt}`,
  };

  const headers = {
    ...authHeaders,
    ...standardHeaders,
  }

  try {
    const { data, status: s } = await axios({
      method: 'post',
      url: `${env.writeHotUrl}/me/update`,
      headers: headers,
      timeout: 15_000,
      data: {
        name: name,
        handle: handle,
        about: about
      }
    });
    response = data;
    status = s;
    errors = data?.errors;
  } catch (error) {
    console.error(error);

    if (error.response) {
      status = error.response.status;

      if (!!error.response.errors) {
        errors = { errors: error.response.errors };
      } else {
        errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
      }
    } else if (error.request) {
      errors = { errors: [{ message: UNABLE_TO_CONNECT_ERROR_MESSAGE }] };
    } else {
      errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
    }
  }

  if (!errors && !response.id) {
    errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
  }

  return [response, errors, status];
}

export const createCommunity = async (name, handle, _private, jwt) => {

  if (!jwt) {
    return [null, { errors: [{ message: UNAUTHORIZED }] }, 401];
  }

  let errors = null;
  let response = null;
  let status = 200;

  const authHeaders = {
    "Authorization": `Bearer ${jwt}`,
  };

  const headers = {
    ...authHeaders,
    ...standardHeaders,
  }

  try {
    const { data, status: s } = await axios({
      method: 'post',
      url: `${env.writeHotUrl}/communities/create`,
      headers: headers,
      timeout: 15_000,
      data: {
        name: name,
        handle: handle,
        private: _private
      }
    });
    response = data;
    status = s;
    errors = data?.errors;
  } catch (error) {
    console.error(error);

    if (error.response) {
      status = error.response.status;

      if (!!error.response.errors) {
        errors = { errors: error.response.errors };
      } else {
        errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
      }
    } else if (error.request) {
      errors = { errors: [{ message: UNABLE_TO_CONNECT_ERROR_MESSAGE }] };
    } else {
      errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
    }
  }

  if (!errors && !response.id) {
    errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
  }

  return [response, errors, status];
}

export const deleteCommunity = async (communityHandle, jwt) => {

  if (!jwt) {
    return [null, { errors: [{ message: UNAUTHORIZED }] }, 401];
  }

  let errors = null;
  let response = null;
  let status = 200;

  const authHeaders = {
    "Authorization": `Bearer ${jwt}`,
  };

  const headers = {
    ...authHeaders,
    ...standardHeaders,
  }

  try {
    const { data, status: s } = await axios({
      method: 'post',
      url: `${env.writeHotUrl}/communities/${communityHandle}/delete`,
      headers: headers,
      timeout: 15_000,
    });

    response = data;
    status = s;
    errors = data?.errors;
  } catch (error) {
    console.error(error);

    if (error.response) {
      status = error.response.status;

      if (!!error.response.errors) {
        errors = { errors: error.response.errors };
      } else {
        errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
      }
    } else if (error.request) {
      errors = { errors: [{ message: UNABLE_TO_CONNECT_ERROR_MESSAGE }] };
    } else {
      errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
    }
  }

  return [response, errors, status];
}

/*
  HOT API
*/

export const selectChannel = async (communityHandle, channelHandle, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/channels/select`,
    method: 'post',
    postData: {
      channel_handle: channelHandle
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const community = async (handle, jwt) => {
  const request = {
    url: `${env.readHotUrl}/communities/${handle}`,
    method: 'get',
    postData: null,
    jwt: jwt
  }
  return hotRequest(request);
}

export const communityRoles = async (handle, jwt) => {
  const request = {
    url: `${env.readHotUrl}/communities/${handle}/roles`,
    method: 'get',
    postData: null,
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const channel = async (communityHandle, channelHandle, page, jwt) => {
  const request = {
    url: `${env.readHotUrl}/communities/${communityHandle}/channels/${channelHandle}?page=${page}`,
    method: 'get',
    postData: null,
    jwt: jwt
  }
  return hotRequest(request);
}

export const createChannel = async (communityHandle, name, groupId, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/channels/create`,
    method: 'post',
    postData: {
      group_id: groupId,
      name: name,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const editChannel = async (communityHandle, name, groupId, channelId, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/channels/edit`,
    method: 'post',
    postData: {
      group_id: groupId,
      name: name,
      channel_id: channelId,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const editGroup = async (communityHandle, groupId, name, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/groups/edit`,
    method: 'post',
    postData: {
      group_id: groupId,
      name: name,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const createGroup = async (communityHandle, name, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/groups/create`,
    method: 'post',
    postData: {
      name: name,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const editProfilePicture = async (file, jwt) => {
  const form = new FormData();
  form.append('documents', file);
  const request = {
    url: `${env.writeHotUrl}/me/edit-profile-picture`,
    form: form,
    jwt: jwt
  }
  return multiPartRequest(request);
}

export const createMessage = async (communityHandle, channelId, text, parentId, files, jwt) => {
  const form = new FormData();
  form.append('text', text);
  form.append('channel_id', channelId);
  if (!!parentId) {
    form.append('parent_id', parentId);
  }
  if (!!files) {
    form.append('files', files);
  }
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/messages/create`,
    form: form,
    jwt: jwt
  }
  return multiPartRequest(request);
}

export const editMessage = async (communityHandle, messageId, text, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/messages/edit`,
    method: 'post',
    postData: {
      text: text,
      message_id: messageId,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const reactMessage = async (communityHandle, messageId, reaction, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/messages/react`,
    method: 'post',
    postData: {
      reaction: reaction,
      message_id: messageId,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const communityUsers = async (communityHandle, jwt) => {
  const request = {
    url: `${env.readHotUrl}/communities/${communityHandle}/users`,
    method: 'get',
    postData: null,
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const createRole = async (communityHandle, input, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/roles/create`,
    method: 'post',
    postData: JSON.parse(input),
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const editCommunity = async (communityHandle, input, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/edit`,
    method: 'post',
    postData: JSON.parse(input),
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const editDefaultPermissions = async (communityHandle, input, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/default-permissions/edit`,
    method: 'post',
    postData: JSON.parse(input),
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const editRole = async (communityHandle, input, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/roles/edit`,
    method: 'post',
    postData: JSON.parse(input),
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const deleteRole = async (communityHandle, input, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/roles/delete`,
    method: 'post',
    postData: JSON.parse(input),
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const deleteGroup = async (communityHandle, groupId, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/groups/delete`,
    method: 'post',
    postData: {
      group_id: groupId,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const deleteChannel = async (communityHandle, channelId, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/channels/delete`,
    method: 'post',
    postData: {
      channel_id: channelId,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const communityRole = async (communityHandle, roleId, jwt) => {
  const request = {
    url: `${env.readHotUrl}/communities/${communityHandle}/roles/${roleId}`,
    method: 'get',
    postData: null,
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const defaultPermissions = async (communityHandle, jwt) => {
  const request = {
    url: `${env.readHotUrl}/communities/${communityHandle}/default-permissions`,
    method: 'get',
    postData: null,
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const leaveCommunity = async (communityHandle, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/leave`,
    method: 'post',
    postData: null,
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const joinCommunity = async (code, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/invite/accept`,
    method: 'post',
    postData: {
      code: code,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const createInvite = async (communityHandle, expiresOnUse, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/invites/create`,
    method: 'post',
    postData: {
      expires_on_use: expiresOnUse,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const editRolesPriority = async (communityHandle, roleIds, jwt) => {
  const request = {
    url: `${env.writeHotUrl}/communities/${communityHandle}/roles/edit-priority`,
    method: 'post',
    postData: {
      role_ids: roleIds,
    },
    jwt: jwt
  }
  return authorizedRequest(request);
}

export const checkInvite = async (code, jwt) => {
  const request = {
    url: `${env.readHotUrl}/invite?code=${code}`,
    method: 'get',
    postData: null,
    jwt: jwt
  }
  return hotRequest(request);
}

const multiPartRequest = async ({ url, form, jwt }) => {
  let errors = null;
  let response = null;
  let status = 200;

  const authHeaders = {
    "Authorization": `Bearer ${jwt}`,
  };

  const headers = {
    ...authHeaders,
    ...multipartHeaders,
  }

  try {
    const { data, status: s } = await axios({
      method: "post",
      url: url,
      headers: headers,
      timeout: 15_000,
      data: form,
    });

    response = data;
    status = s;
    errors = data?.errors;
  } catch (error) {
    console.error(error);

    if (error.response) {
      if (!!error.response.errors) {
        errors = { errors: error.response.errors };
      } else {
        errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
      }
    } else if (error.request) {
      errors = { errors: [{ message: UNABLE_TO_CONNECT_ERROR_MESSAGE }] };
    } else {
      errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
    }
  }

  return [response, errors, status];
}

export const hotRequest = async ({ url, method, postData, jwt }) => {
  let errors = null;
  let response = null;
  let status = 200;

  const authHeaders = !!jwt ? {
    "Authorization": `Bearer ${jwt}`,
  } : { };

  const headers = {
    ...authHeaders,
    ...standardHeaders,
  }

  try {
    const { data, status: s } = await axios({
      method: method,
      url: url,
      headers: headers,
      timeout: 15_000,
      data: postData,
    });

    response = data;
    status = s;
    errors = data?.errors;
  } catch (error) {
    console.error(error);

    if (error.response) {
      if (!!error.response.errors) {
        errors = { errors: error.response.errors };
      } else {
        errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
      }
    } else if (error.request) {
      errors = { errors: [{ message: UNABLE_TO_CONNECT_ERROR_MESSAGE }] };
    } else {
      errors = { errors: [{ message: UNEXPECTED_ERROR_MESSAGE }] };
    }
  }

  return [response, errors, status];
}

const authorizedRequest = async ({ url, method, postData, jwt }) => {

  if (!jwt) {
    throw redirect("/join-beta")
  }

  return hotRequest({ url, method, postData, jwt })
}
