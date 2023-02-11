# Authentication API using ExpressJS

## key features

* Basic authetication (register, login, logout)
* Ability to change password
* Ability to reset password by email
* Persistent session using cookies
* Anti password/reset code bruteforce protection
* Anti DDOS protection
* OpenAPI 3 specification
* Swagger UI

## How to use

1) Install packages 

        npm install
  
2) Register a temporary email using https://ethereal.email/ (this is important to test password reset by mail)

3) Create `.env.dev` file based on `.env.dev.template` file in root porject directory and configure your ethereal email credentials

4) Run the server:

      Linux:

          DEBUG=express-auth:* NODE_ENV=development npm start

      Windows: 

          $env:debug='express-auth:*'; $env:NODE_ENV='express-auth:*'; npm start     
      
      The Swagger UI should be at http://localhost:3000/api-docs
