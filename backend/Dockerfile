FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# NOTE: Generate package-lock.json before building (run npm install locally first).
# Once package-lock.json exists, switch to: RUN npm ci --production
RUN npm install --production

COPY . .

EXPOSE 3000

USER node

CMD ["node", "server.js"]
