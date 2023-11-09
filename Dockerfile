FROM node:latest as node
WORKDIR /app
COPY . .


RUN npm install yarn -g
RUN yarn add -g @nrwl/cli
RUN yarn installe
RUN npx nx build app-smart-cloud
#--configuration=production
#RUN pwd && ls

#stage 2
FROM nginx:alpine
COPY ./apps/app-smart-cloud/nginx.conf /etc/nginx/nginx.conf
COPY --from=node app/dist/apps/app-smart-cloud /usr/share/nginx/html
