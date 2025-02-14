# write a docker file for thenext js application
# use the node image as the base image

FROM node:20

# set the working directory
WORKDIR /app

# copy the package.json file to the working directory
COPY package.json .

# install the dependencies
RUN npm i -g pnpm && pnpm install

# copy the source code to the working directory
COPY . .

# build the application
RUN pnpm build