FROM node:22.11.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./src ./src

EXPOSE 9090

CMD ["npm","start"]