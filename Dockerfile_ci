FROM node:16.13.1

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm install && npm run build

# TODO: Need to configure npm run build else since prod build does not include babel

ENV NODE_ENV "production"

EXPOSE 3001 443
CMD ["npm", "run", "start"]
