FROM node:24.15.0-bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl git openssh-client && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Go
RUN curl -fsSL https://go.dev/dl/go1.25.7.linux-amd64.tar.gz | tar -C /usr/local -xz
ENV PATH="/usr/local/go/bin:${PATH}"

# Copy ONLY Go dependency files
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg/mod \
    go mod download

ARG WEBSITEBOT_GITHUB_TOKEN
RUN git config --global url."https://${WEBSITEBOT_GITHUB_TOKEN}@github.com/".insteadOf "ssh://git@github.com/"

# Copy ONLY npm dependency files
COPY package.json package-lock.json ./
RUN --mount=type=ssh \
    --mount=type=cache,target=/root/.npm \
    npm ci

# NOW copy the rest of the source
COPY . .

# Build steps that use the source
RUN go install
RUN npm install

CMD ["npm", "run", "start:website"]

EXPOSE 4000
