# See also: 
# https://gist.github.com/aradalvand/04b2cad14b00e5ffe8ec96a3afbb34fb
# https://stackoverflow.com/questions/77370575/how-can-i-add-svelte-to-my-docker-container-with-django

FROM node:21-alpine AS builder
WORKDIR /app
COPY package*.json .
COPY .npmrc .
RUN npm install --force
COPY . .
ENV GENERATE_SOURCEMAP false
RUN NODE_OPTIONS="--max-old-space-size=16000"
RUN npm run build
RUN npm prune --production

FROM node:21-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
COPY .env .
COPY .env.* .

EXPOSE 5173
ENV NODE_ENV=production

# Use -r "dotenv-flow/config" for loading the corresponding .env.{NODE_ENV} file.
CMD PORT=5173 node -r "dotenv-flow/config" build