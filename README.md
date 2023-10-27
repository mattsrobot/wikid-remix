# Install dependencies (node_modules)

Run ```npm install```

# Setup .env file

Create a .env file in the project root with the following:

```
X_WICKED_HEADER='something'
API_URL='http://localhost:3003/v1'
HOT_URL='http://localhost:3005/v1'
```

X_WICKED_HEADER is a header used to identify clients connecting to the API. For running locally you can use any value, but for connecting to the production environment - Cloudflare will block requests without a valid header.

API_URL is the Auth server (usually port 3003 locally).

HOT_URL is the Hot server (usually port 3005 locally).

# Running the app locally

```npx remix dev```

You should see a Remix server running locally on port 3000

# Creating a new user

In order to create an account you'll need to create a new record in the beta_users table (assuming you have a MySQL server running and have run go migrate to setup the tables).

Create a new entry in beta_users with your email address, with redeemed set to 0, and enabled set to 1.

Now you can navigate your browser to http://localhost:3000/signup and create your user.

# Building web app app:

```
npx remix dev
```

# Building electron app:

```
npm run desktop-dev
```

# Installing ES modules

```
npx rmx-cli get-esm-packages framer-motion
```

Then modify remix.config
