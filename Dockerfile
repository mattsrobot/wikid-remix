# syntax=docker/dockerfile:1

FROM node:bookworm-slim as base

EXPOSE 3000
ENV NODE_ENV production

FROM base as deps

WORKDIR /myapp

ADD server.mjs ./
ADD package.json ./
RUN npm install --include=dev

FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD server.mjs ./
ADD package.json ./
RUN npm prune --omit=dev

FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD . .
RUN npx remix build

FROM base

ENV NODE_ENV="production"

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/public /myapp/public
COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/server.mjs /myapp/server.mjs

CMD ["node", "server.mjs"]
