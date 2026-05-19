
FROM oven/bun:1.3.12 AS base
WORKDIR /usr/src/app


COPY package.json bun.lock ./
RUN bun install
COPY . .

ENV NODE_ENV=production
RUN bun run build

# FROM base AS release
# COPY --from=install /temp/prod/node_modules node_modules
# RUN mkdir -p node_modules/.vite
# COPY --from=prerelease /usr/src/app/dist .
# COPY --from=prerelease /usr/src/app/package.json .

EXPOSE 4173/tcp
ENTRYPOINT [ "bun", "run", "preview" ]