<p align="center">
  <a href="https://flare.network/" target="blank"><img src="https://flare.network/wp-content/uploads/Artboard-1-1.svg" width="400" height="300" alt="Flare Logo" /></a>
</p>

Welcome to Flare EVM Transaction Verifier server.

This verifier is created based on the [Verifier Server Template](https://gitlab.com/flarenetwork/verifier-server-template) based on the [EVMTransaction](https://gitlab.com/flarenetwork/state-connector-protocol/-/blob/main/specs/attestations/active-types/EVMTransaction.md). It is implemented by using [Nest](https://github.com/nestjs/nest) framework.

## Installation

```bash
$ yarn
```

## Configuration

Configuration of the verifier server is carried out through environment variables, specifically by using standard `ConfigModule` from Nest.js, which gets configured from `.env` file in the root of the repository (working directory when run). See details [here](./src/config/configuration.ts).

`PORT` specifies the port that is used for HTTP (default is port number 3000).

`API_KEYS` are keys that allow connection to the HTTP service.

`RPC` is an optional parameter for a RPC connection (default is `https://flare-api.flare.network/ext/C/rpc`).

## Running the app

```bash
# Use the default env
cp .env.example .env
# Or configure your by editing the .env file

# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Example on Flare network

Copy `.env.example` file and rename it to `.env`.
Run the code with `yarn start:dev`
Check the Swagger interface in browser at `http://localhost:4500/api`.
Use `Authorize` button to enter API key `abc123`.
Test API routes `/EVMTransaction/prepareResponse`, `/EVMTransaction/mic` and `/EVMTransaction/prepareRequest` with the following parsed request for a transaction on Flare network.

```
{
  "attestationType": "0x45564d5472616e73616374696f6e000000000000000000000000000000000000",
  "sourceId": "0x4554480000000000000000000000000000000000000000000000000000000000",
  "requestBody": {
    "transactionHash": "0xe1ad057e71ac82cd2eaaee0dc8700a2c1b6cff4f295a7674b9e97a5f8dd9b51c",
    "requiredConfirmations": "1",
    "provideInput": true,
    "listEvents": true,
    "logIndices": ["0"]
  }
}
```

In order to test the API route `/EVMTransaction` use the output of `/EVMTransaction/prepareRequest`.

Localy you can check the service with `curl`:

```
 curl -X 'POST'   'http://localhost:4500/EVMTransaction/prepareResponse'   -H 'accept: */*'   -H 'X-API-KEY: 12345'   -H 'Content-Type: \application/json'   -d '{\
       "attestationType": "0x45564d5472616e73616374696f6e000000000000000000000000000000000000",\
       "sourceId": "0x4554480000000000000000000000000000000000000000000000000000000000",\
       "requestBody": {\
       "transactionHash": "0xb11e60decfd2ae39d2ec927fb783aa009c052044c795bf9346f46741f488512c",\
       "requiredConfirmations": "3",\
       "provideInput": false,\
       "listEvents": true,\
       "logIndices": []\
     }\
   }'
```

## Code Tests

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## License

This template is under [MIT licensed](LICENSE).
