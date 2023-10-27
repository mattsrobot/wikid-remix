import { Flex, Text, Button, Card, TextField, Heading, Link, Checkbox, Callout, Box } from '@radix-ui/themes';
import { useState, useCallback, useEffect } from "react";
import { useSubmit, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import * as EmailValidator from 'email-validator';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { signUp } from "../wikid.server.js";
import { sessionStorage, USER_SESSION_KEY } from "../sessions.server.js";
import { redirect, json } from "@remix-run/node";
import env from "../environment.server.js";

import '../components/styles.signup.css';

export const meta = () => {
  return [
    {
      title: "Wikid | sign up"
    },
    {
      property: "og:title",
      content: "Wikid | sign up",
    },
    {
      name: "description",
      content: "Where communities meet",
    },
  ];
};

export async function action({ request }) {
  const body = await request.formData();

  const input = JSON.parse(body.get("input"));

  const [response, errors] = await signUp({ input: input });

  if (!!errors) {
    console.error(errors);
    if (errors[0].message.includes("beta test")) {
      throw redirect("/join-beta");
    }
    return json({errors: errors});
  }

  if (!response.token) {
    console.error("No jwt token returned");
    return json([{ message: "Not allowed" }]);
  }

  if (env.electron) {
    electron.set(USER_SESSION_KEY, response.token);
    throw redirect("/c/get-started");
} else {
    const cookie = request.headers.get("Cookie");
    const session = await sessionStorage.getSession(cookie);
    session.set(USER_SESSION_KEY, response.token);

    throw redirect("/c/get-started", {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session, {
                maxAge: 60 * 60 * 24 * 30,
            }),
        },
    });
  }
}


export const loader = async ({request}) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  return json({
      code: code,
      electron: env.electron,
   });
}

export default function Signup() {
  const data = useLoaderData();
  const code = data.code;
  const navigation = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [dob, setDob] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [valid, setValid] = useState(false);

  const toggleAgreed = useCallback(() => { setAgreed(current => !current); }, []);
  const toggleDob = useCallback(() => { setDob(current => !current); }, []);

  const handleSignUp = useCallback(() => {
    if (!valid) {
      return;
    }

    const input = {
      email: email,
      password: password,
      handle: handle,
      code: code,
    };

    const data = {
      input: JSON.stringify(input)
    }

    submit(data, { method: "post" });
  }, [email, password, handle, agreed, valid, code]);

  useEffect(() => {
    setValid(EmailValidator.validate(email) && password.length >= 6 && handle.length >= 3 && agreed && dob);
  }, [email, password, handle, agreed, dob]);

  return (
    <Flex direction="column" className="wk-main-content">
      {data.electron && <nav className='wk-heading'>
        <Text weight="bold">&nbsp;</Text>
      </nav>}
      <Flex direction="row" pt="9" align="start" justify="center" wrap="wrap" gap="9" className='wk-under-content'>
        <Card size="4" className='wk-fullwidth' style={{maxWidth: 400}}>
          <Flex direction="column" gap="2">
            <Heading>Signup to Wikid</Heading>
            <Box pt="2"></Box>
            {!!actionData?.errors && <Callout.Root color='red'>
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>
                {actionData.errors[0].message}
              </Callout.Text>
            </Callout.Root>}
            <Flex direction="column" gap="0">
              <Text weight="bold" size="2">Email</Text>
            </Flex>
            <TextField.Root>
              <TextField.Input aria-label='Email address input' value={email} placeholder="" type='email' onChange={(v) => {
                setEmail(v.currentTarget.value.toLowerCase());
              }} />
            </TextField.Root>
            <Flex direction="column" gap="0">
              <Text weight="bold" size="2">Password</Text>
            </Flex>
            <TextField.Root>
              <TextField.Input aria-label='Password input' value={password} placeholder="" type='password' onChange={(v) => {
                setPassword(v.currentTarget.value);
              }} />
            </TextField.Root>
            <Flex direction="column" gap="0">
              <Text weight="bold" size="2">Your unique handle</Text>
              <Text color='gray' size="2">So people can @ mention you in discussions.</Text>
            </Flex>
            <TextField.Root>
              <TextField.Input aria-label='Unique handle input' placeholder="" type='text' onChange={(v) => {
                setHandle(v.currentTarget.value.toLowerCase());
              }} />
            </TextField.Root>
            <Text as="label" size="2">
              <Flex gap="2">
                <Checkbox aria-label='Agree to terms and conditions input' checked={dob} onCheckedChange={toggleDob} /> I am at least 13 years old.
              </Flex>
            </Text>
            <Text as="label" size="2">
              <Flex gap="2">
                <Checkbox aria-label='Agree to terms and conditions input' checked={agreed} onCheckedChange={toggleAgreed} /> I agree to the <Link   href='/terms' color="pink">terms and conditions.</Link>
              </Flex>
            </Text>
            <Button radius='full' mt="4" aria-label='Sign up to Wikid button' disabled={!valid || navigation.state == "submitting"} onClick={handleSignUp}>Signup</Button>
            <Text align="center" size="2">Already got an account, <Link   size="2" href="/login">login to Wikid</Link></Text>
          </Flex>
        </Card>
      </Flex>
    </Flex>);
}
