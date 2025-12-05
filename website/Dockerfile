FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV=development

CMD ["npm", "run", "dev"]

