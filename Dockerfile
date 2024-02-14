# Use the official Node.js 14.15.0 image as the base image
FROM node:15

# Set the working directory inside the container
WORKDIR /app

# Remove existing node_modules folder if any
RUN rm -rf node_modules

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

#without this docker throws an error node_sqlite3.node: invalid ELF header
RUN npm rebuild sqlite3

#unit test cases
RUN npx jest

#End 2 End tests
RUN npm run test:e2e

# Build the application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD ["node", "dist/main"]
