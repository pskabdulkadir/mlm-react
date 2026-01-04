FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (dev deps needed for build)
COPY package.json package-lock.json* ./
RUN npm ci --production=false

COPY . .

# Build (assumes repo has build script that compiles server and client)
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and production deps
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json* ./
RUN npm ci --production=true

EXPOSE 3000
CMD ["npm", "run", "start"]
