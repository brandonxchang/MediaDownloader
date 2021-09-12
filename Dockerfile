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

# Get locales and use UTF-8
RUN apt-get install -y locales
# Uncomment en_US.UTF-8 for inclusion in generation
RUN sed -i 's/^# *\(en_US.UTF-8\)/\1/' /etc/locale.gen
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production
COPY --from=0 /usr/src/app/dist .
COPY .env .

EXPOSE 3000

CMD [ "node", "-r", "dotenv/config", "index.js" ]