FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
RUN ls
RUN npm install
COPY . .

EXPOSE 5001

CMD ["npm", "start"]