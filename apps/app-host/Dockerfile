FROM node:18.18.2 as node
WORKDIR /app
COPY . .

#RUN npm install --global yarn
RUN pwd && ls
RUN yarn global add @nrwl/cli
RUN yarn install
RUN npx nx build app-host
#--configuration=production


#stage 2
FROM nginx:alpine
COPY ./apps/app-host/nginx.conf /etc/nginx/nginx.conf
COPY --from=node app/dist/apps/app-host /usr/share/nginx/html
