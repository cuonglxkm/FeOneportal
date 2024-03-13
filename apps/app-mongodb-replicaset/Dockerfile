FROM node:18.18.2 as node
WORKDIR /app
COPY . .
RUN pwd && ls
RUN yarn global add @nrwl/cli
RUN yarn install
RUN npx nx build app-mongodb-replicaset --configuration=production
#RUN pwd && ls
#stage 2
FROM nginx:alpine
COPY ./apps/app-mongodb-replicaset/nginx.conf /etc/nginx/nginx.conf
COPY --from=node app/dist/apps/app-mongodb-replicaset /usr/share/nginx/html
