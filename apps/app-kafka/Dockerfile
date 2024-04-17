# stage 1 cache node_modules
FROM registry.onsmartcloud.com/idg/node:18 as installer
WORKDIR /app

COPY package.json .

RUN yarn install

# stage 2 build image
FROM registry.onsmartcloud.com/idg/node:18 as node
WORKDIR /app
COPY --from=installer /app /app

COPY . .

RUN pwd && ls
RUN yarn global add @nrwl/cli
# RUN yarn install
# RUN npm install apexcharts@3.35.3
# RUN npm install ng-apexcharts@1.5.0
RUN npx nx build app-kafka --configuration=production
#RUN pwd && ls

#stage 2
FROM nginx:alpine
COPY ./apps/app-kafka/nginx.conf /etc/nginx/nginx.conf
COPY --from=node app/dist/apps/app-kafka /usr/share/nginx/html
