FROM oven/bun

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

RUN bun install

COPY . .
RUN bun run build

CMD ["bun", "run", "start"]
