FROM registry.onsmartcloud.com/idg/node:18 as node
WORKDIR /app
COPY package.json .

RUN yarn install

RUN pwd && ls
RUN yarn global add @nrwl/cli
RUN yarn install
RUN npx nx build app-kubernetes --configuration=production
#RUN pwd && ls

#stage 2
FROM nginx:alpine
COPY ./apps/app-kubernetes/nginx.conf /etc/nginx/nginx.conf
COPY --from=node app/dist/apps/app-kubernetes /usr/share/nginx/html
