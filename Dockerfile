FROM node:8.14.1-alpine
ARG serverBase
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
# RUN node config
# RUN npm run build:prod
# EXPOSE 8080
# CMD [ "npm" ,"run" ,"server:prod"]


RUN node config.js serverBase=$serverBase
RUN npm run build:prod
EXPOSE 8080
CMD [ "npm" ,"run" ,"server:prod"]