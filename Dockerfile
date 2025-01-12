# Build stage
FROM node:22-alpine3.19 AS build

WORKDIR /usr/src/app

# Copy package files
COPY . .

# Install dependencies
RUN yarn install --frozen-lockfile
RUN yarn run build

FROM node:22-alpine3.19
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist /usr/src/app/dist
EXPOSE 4000

CMD ["node", "dist/index.js"]