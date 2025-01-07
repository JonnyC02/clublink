FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run compile

FROM alpine
COPY --from=builder /app/build /root/home/build
EXPOSE 3001
CMD ["./build/server"]