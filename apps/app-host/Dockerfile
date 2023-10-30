FROM node:latest as node
WORKDIR /app
COPY . .


RUN npm install -g @nrwl/cli
RUN npm install --force
RUN npx nx build app-host
#--configuration=production
#RUN pwd && ls

#stage 2
FROM nginx:alpine
COPY ./apps/app-host/nginx.conf /etc/nginx/nginx.conf
COPY --from=node app/dist/apps/app-host /usr/share/nginx/html
