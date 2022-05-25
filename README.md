# E-learning Backend

This repo is the GraphQL backend for AASTU e-learning built for 2022 Software Engineering Capstone Project. It is built with [Nestjs](https://nestjs.com/).

## Installation

```bash
$ npm install
```

## Configuration

Create a `.env` file inside the project root folder to place environment variables.

### Required Variables

- `PORT` : Port to the server will run on (Number)
- `DATABASE_URL` : Database connection string
- `SESSION_SECRET` : Http Session secret
- `MAIL_HOST` : Mail Provider Host address
- `MAIL_PORT` : Mail Provider Port (Number)
- `MAIL_IS_SECURE` : Does Mail Provider use secure connection (Boolean)
- `MAIL_USER` : Mail Provider Credential
- `MAIL_PASSWORD` : Mail Provider Credential
- `JWT_SECRET`: JWT Secret Key
- `FRONTEND_URL` : URL for E-learning frontend Server
- `EMAIL_VERIFICATION_URL` : URL for redirection during email verification
- `TELEGRAM_AUTH_URL` : URL for client authorization of Telegram Bot

### Optional (Production Only) Variables

- `HEROKU_URL` : URL of deployed backend instance

### **NOTE**

> To set `TELEGRAM_AUTH_URL` and `EMAIL_VERIFICATION_URL`, you can use [variable expansion](https://docs.nestjs.com/techniques/configuration#expandable-variables). For example:

```
TELEGRAM_AUTH_URL=${FRONTEND_URL}/telegramAuth
EMAIL_VERIFICATION_URL=${FRONTEND_URL}/verify
```

> `FRONTEND_URL` **cannot** be in a local url scheme. It has to be a publicly accessible **https** url. Therefore, during development, you can use [NGROK](https://ngrok.com/) to create a tunnel to your development server. You can run NGROK manually or through a docker container. For use with docker use the following commands:

```bash
# Replace <NGROK_TOKEN> with your NGROK Authentication Token and <PORT> with the port your frontend server is running on

# On linux
docker run -d --name ngrok --net=host -e NGROK_AUTHTOKEN=<NGROK_TOKEN> ngrok/ngrok http <PORT>

# On Windows
docker run -d --name ngrok -p 4040:4040 -e NGROK_AUTHTOKEN=<NGROK_TOKEN> ngrok/ngrok http host.docker.internal:<PORT>
```

## Running the app

### **[MANDATORY-STEP]** First generate the `ts-schema` via
```
$ npm run schema-gen
```
### Run the app in the desired mode

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Team

### [Backend]()

1. [Adem Mohammed](https://github.com/abulhuman)
1. [Ezira Ashenafi](https://github.com/eazash22)

### [Frontend]()

1. [Betel Dessaleng](https://github.com/BettyBane)
1. [Eyob Aschenaki](https://github.com/EyobAshenaki)
