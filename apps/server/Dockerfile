FROM node:20.19.4-slim

ENV PNPM_HOME=/home/node/.local/share/pnpm \
    PNPM_STORE_PATH=/workspace/.pnpm-store \
    PATH="${PNPM_HOME}:${PATH}" \
    NODE_ENV=development

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl sqlite3 \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable pnpm

WORKDIR /workspace

COPY docker/dev-entrypoint.sh /usr/local/bin/dev-entrypoint.sh
RUN chmod +x /usr/local/bin/dev-entrypoint.sh \
    && mkdir -p /workspace /workspace/.pnpm-store /home/node/.local/share/pnpm \
    && chown -R node:node /workspace /home/node/.local/share/pnpm

USER root

ENTRYPOINT ["dev-entrypoint.sh"]
CMD ["pnpm", "--filter", "@nups-nasa/server", "dev"]
