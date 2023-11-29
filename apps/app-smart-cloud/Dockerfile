FROM node:18.18.2 as node
WORKDIR /app
COPY . .

RUN pwd && ls
RUN yarn global add @nrwl/cli
RUN yarn install
RUN npx nx build app-smart-cloud --configuration=production
#RUN pwd && ls

#stage 2
FROM nginx:alpine
COPY ./apps/app-smart-cloud/nginx.conf /etc/nginx/nginx.conf
COPY --from=node app/dist/apps/app-smart-cloud /usr/share/nginx/html
