# 构建阶段
FROM node:22-alpine AS development

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node pnpm-lock.yaml ./

RUN npm install -g pnpm@9.5.0

RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

RUN pnpm prisma:generate

RUN pnpm build

USER node

# 生产阶段
FROM node:22-alpine AS production

WORKDIR /app

COPY --chown=node:node --from=development /app/package*.json ./
COPY --chown=node:node --from=development /app/pnpm-lock.yaml ./

RUN npm install -g pnpm@9.5.0

RUN pnpm install --frozen-lockfile --prod

COPY --chown=node:node --from=development /app/dist ./dist
COPY --chown=node:node --from=development /app/prisma ./prisma
COPY --chown=node:node --from=development /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["node", "app/dist/main.js"]