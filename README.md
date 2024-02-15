# URL Shortening API

## Overview
The URL Shortening API is a versatile service designed to simplify URL management tasks. It allows users to shorten long URLs into compact forms, facilitating easy sharing and tracking. With support for custom alias links, users can create personalized shortcuts for their URLs. The API also offers comprehensive statistics on URL usage, including visitor counts. Additionally, users can manage their shortened URLs by updating, deleting, and setting request limits, ensuring control and flexibility in URL management, similar to bit.ly.

## Technologies Used
- NestJS
- NodeJS
- Sequelize
- SQLite3
- Swagger-UI
- Jest

## Features
- Shorten any URL with automatic generation of shortened URL
- Set custom alias URLs for personalized shortcuts
- Add request limits to URLs, blocking access after visitor count reaches limit
- API to delete URLs with appropriate handling of blocked requests
- Can update alias URL and request limits dynamically
- API to provide statistics such as visitor count
- Conforms to OpenAPI standards with APIs accessible from Swagger UI
- Enforces data integrity with DB level checks, constraints, and indexing for fast queries
- Transactions for atomicity and consistency in database operations
- Validation of API calls from the service layer and DTO layer using validation annotations
- Proper error handling (using Middleware) with appropriate HTTP response codes
- Logging of essential data for monitoring and debugging
- End-to-End (E2E) tests to ensure complete flow and error handling
- Dockerized application for easy deployment
- Unit tests with Jest for code quality assurance
- Persistence of data after app shutdown
- Asynchronous and non-blocking API calls for scalability

## Further Improvements
- Introduce another table to record visitors' IP addresses, timestamps, etc.
- Utilize linting tools to ensure code quality
- Increase unit test coverage
- Conduct performance testing to optimize performance
- Enhance database query efficiency
- Perform load and concurrency testing to assess scalability
- Use a proxy server for testing to track incoming users' IP addresses for analytics

## Getting Started

1. Clone the repository from [GitHub](https://github.com/ExcitedHumvee/URL-Shortener) with:
    ```
    git clone https://github.com/ExcitedHumvee/URL-Shortener
    ```
2. Navigate into the project folder
3. Install dependencies with:
    ```
    sudo npm install
    ```
4. Run unit tests (optional) with:
    ```
    npx jest
    ```
5. Run end-to-end (E2E) tests (recommended, optional) with:
    ```
    npm run test:e2e
    ```
6. Start the application with:
    ```
    npm run start
    ```
7. Go to [http://localhost:3000/api](http://localhost:3000/api) in the browser to access Swagger UI.
8. Build Docker image:
    - Ensure Docker engine is running (open Docker Desktop) and the node application is stopped
    - Build the image with:
        ```
        docker build -t stanydesa/nest-app .
        ```
    - Run the container with:
        ```
        docker run -d -p 3000:3000 stanydesa/nest-app
        ```
9. Check container status with:
    ```
    docker ps
    ```

