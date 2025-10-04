FROM node:20.19.4-slim

# Set up pnpm environment variables so pnpm binary is discoverable.
ENV PNPM_HOME=/home/node/.local/share/pnpm \
    PNPM_STORE_PATH=/workspace/.pnpm-store \
    PATH="${PNPM_HOME}:${PATH}" \
    NODE_ENV=development \
    CI=true

# Enable corepack and prepare specific pnpm version so pnpm is available during build.
RUN corepack enable \
    && corepack prepare pnpm@10.18.0 --activate

WORKDIR /workspace

# Prepare directories early and set ownership so later steps running as node won't hit permission issues.
RUN mkdir -p /workspace /workspace/.pnpm-store /home/node/.local/share/pnpm \
    && chown -R node:node /workspace /home/node/.local/share/pnpm

# Copy lockfile and package.json first to leverage Docker layer caching.
COPY package.json pnpm-lock.yaml ./

# Prune store (safe noop if empty) and install dependencies.
# Force postinstall scripts (some native binaries are fetched during postinstall).
# After install, attempt to add the ARM64 rollup native package; ignore failure if not applicable.
RUN pnpm store prune || true \
    && pnpm install --no-frozen-lockfile --ignore-scripts=false \
    && pnpm add -D @rollup/rollup-linux-arm64-gnu@* || true

# Copy rest of repository
COPY . .

# Install dev-entrypoint and make executable
COPY docker/dev-entrypoint.sh /usr/local/bin/dev-entrypoint.sh
RUN chmod +x /usr/local/bin/dev-entrypoint.sh

# Ensure workspace ownership is correct for non-root user
RUN chown -R node:node /workspace /home/node/.local/share/pnpm /usr/local/bin/dev-entrypoint.sh

USER node

ENTRYPOINT ["/usr/local/bin/dev-entrypoint.sh"]
CMD ["pnpm", "--filter", "@nups-nasa/client", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
