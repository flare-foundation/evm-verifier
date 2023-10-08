<p align="center">
  <a href="https://flare.network/" target="blank"><img src="https://flare.network/wp-content/uploads/Artboard-1-1.svg" width="400" height="300" alt="Flare Logo" /></a>
</p>

Welcome to Flare EVM Transaction Verifier server.

This verifier is created based on the [Verifier Server Template](https://gitlab.com/flarenetwork/verifier-server-template) based on the [EVMTransaction](https://gitlab.com/flarenetwork/state-connector-protocol/-/blob/main/specs/attestations/active-types/EVMTransaction.md). It is implemented by using [Nest](https://github.com/nestjs/nest) framework.


## Installation

```bash
$ yarn
```

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

## Test

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

## Example successful request on Flare network

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