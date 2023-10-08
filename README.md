<p align="center">
  <a href="https://flare.network/" target="blank"><img src="https://flare.network/wp-content/uploads/Artboard-1-1.svg" width="400" height="300" alt="Flare Logo" /></a>
</p>

Welcome to Flare verifier server template.

This template can be used to implement an verifier server that implements the required features for adding new attestation types. Read mora about adding attestation types and state connector protocol in the [docs page](https://docs.flare.network/tech/state-connector/) or directly in the [reference repo](link when we publish TODO:)

This template was created using [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.


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
## Adding support for attestation type

To add a new attestation type use the State Connector utils from [this repo](https://gitlab.com/flarenetwork/state-connector-protocol/). The procedure is as follows:

- Clone this repo. Ideally into both cloned repo folders, this and [State Connector Protocol](https://gitlab.com/flarenetwork/state-connector-protocol/) ones should be placed into the same folder. 
- This repos is configured for example attestation type `TypeTemplate`. However you can use any attestation type defined in the [State Connector Protocol](https://gitlab.com/flarenetwork/state-connector-protocol/) repo and initialize the this repo with all relevant code related to a specific attestation type. For example, to provide the support for `Payment` attestation type, use the following command from the root of the [State Connector Protocol](https://gitlab.com/flarenetwork/state-connector-protocol/)
```
yarn generate verifier-template-refresh -t Payment
```
Consult the documentation for use of the [State Connector Utils]() CLI for details.
## License

This template is under [MIT licensed](LICENSE).
