########################################################
########### Stage 1: Compile Typescript code ###########
########################################################

FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Bundle app source
COPY . .

RUN npm install
RUN npm run build


#######################################################
########### Stage 2: build production image ###########
#######################################################

FROM node:16

# Create app directory
WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get --yes install ffmpeg

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production
COPY --from=0 /usr/src/app/dist .

EXPOSE 3000

CMD [ "node", "index.js" ]