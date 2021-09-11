FROM node:16

# Create app directory
WORKDIR /usr/src/app

RUN apk update
RUN apk add ffmpeg

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY /dist/* ./

EXPOSE 3000

CMD [ "node", "index.js" ]