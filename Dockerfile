FROM node:18-bullseye
WORKDIR /app/evm-indexer
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "yarn.lock", "./"]
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000

RUN mkdir -p /app/evm-indexer/logs && chown -R node /app/evm-indexer/logs
USER node

ENV PATH="${PATH}:/app/evm-indexer/docker/scripts"
ENV NODE_ENV=production

ENTRYPOINT [ "/app/evm-indexer/docker/scripts/entrypoint.sh" ]
CMD [ "yarn", "start:prod" ]

