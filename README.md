# E-learning Backend

This repo is the GraphQL backend for AASTU e-learning built for 2022 Software Engineering Capstone Project. It is built with [Nestjs](https://nestjs.com/).

## Installation

```bash
$ npm install
```

## Configuration

Create a `.env` file inside the project root folder with values for `NODE_ENV` and `DATABASE_URL` as shown below:

```env
NODE_ENV=development
DATABASE_URL=postgres://<YOUR_POSTGRES_USERNAME>:<YOUR_POSTGRES_PASSWORD>@<YOUR_POSTGRES_HOST>:<YOUR_POSTGRES_PORT>/<YOUR_POSTGRES_DATABASE_NAME>
PORT=<YOUR_PORT>
```

Replace the values for `<YOUR_POSTGRES_USERNAME>`,  
`<YOUR_POSTGRES_PASSWORD>`,  
`<YOUR_POSTGRES_HOST>`,  
`<YOUR_POSTGRES_PORT>`,  
`<YOUR_PORT>`,  
`<YOUR_POSTGRES_DATABASE_NAME>` accordingly

## Running the app

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
