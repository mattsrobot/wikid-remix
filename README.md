# Install dependencies (node_modules)

Run ```npm install```

# Setup .env file

Create a .env file in the project root with the following:

```
X_WICKED_HEADER='something'
WEB_URL='http://localhost:3000'
WRITE_HOT_URL='http://localhost:3005/v1'
READ_HOT_URL='http://localhost:3005/v1'
WS_URL='ws://localhost:3006/ws'
ELECTRON="false"
```

You'll need to build and run the Go backend to make API requests (HOT_URL and WS_URL is the backend API).

X_WICKED_HEADER is a header used to identify clients connecting to the API. For running locally you can use any value, but for connecting to the production environment - Cloudflare will block requests without a valid header.

# Running the app locally

```npx remix dev```

You should see a Remix server running locally on port 3000

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
