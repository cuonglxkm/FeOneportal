FROM node:18.18.2 as node
WORKDIR /app
COPY . .

#RUN npm install --global yarn
RUN pwd && ls
RUN yarn global add @nrwl/cli
RUN #cp ./apps/app-host/src/assets/module-federation-prod.manifest.json ./apps/app-host/src/assets/module-federation.manifest.json
RUN yarn install
RUN npx nx build app-host --configuration=production
#--configuration=production


#stage 2
FROM nginx:alpine
COPY ./apps/app-host/nginx.conf /etc/nginx/nginx.conf
COPY --from=node app/dist/apps/app-host /usr/share/nginx/html
# When the container starts, replace the env.js with values from environment variables
#CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/module-federation-prod.manifest.json > /usr/share/nginx/html/assets/module-federation.manifest.json"]
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.prod.js > /usr/share/nginx/html/assets/env.js && envsubst < /usr/share/nginx/html/assets/module-federation-prod.manifest.json > /usr/share/nginx/html/assets/module-federation.manifest.json && exec nginx -g 'daemon off;'"]
