FROM node:12.15.0

WORKDIR /usr/src/app

COPY . .

RUN npm i

RUN npm run build

CMD npm start