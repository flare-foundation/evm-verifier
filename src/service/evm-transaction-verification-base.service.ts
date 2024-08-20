import { HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JsonRpcProvider, ethers } from "ethers";
import { readFileSync } from "fs";
import { EVMTransactionSources, IConfig, IGetRPCSource } from "../config/configuration";
import {
    EVMTransaction_RequestNoMic,
    EVMTransaction_Request,
    EVMTransaction_Response,
    AttestationResponseDTO_EVMTransaction_Response,
    AttestationResponseStatus,
} from "../dto/EVMTransaction.dto";
import { AttestationResponseDTO_EVMTransaction_ResponseEncoded } from "../dto/fdcTransactions.dto";
import { MicResponse, EncodedRequestResponse } from "../dto/generic.dto";
import { AttestationDefinitionStore } from "../external-libs/ts/AttestationDefinitionStore";
import { encodeAttestationName, ZERO_BYTES_32, MIC_SALT } from "../external-libs/ts/utils";
import { verifyEVMTransactionRequest } from "../verification/verification";

export interface ExampleData<RNM, REQ, RES> {
    requestNoMic: RNM;
    request: REQ;
    response: RES;
    messageIntegrityCode: string;
    encodedRequestZeroMic: string;
    encodedRequest: string;
}

export interface IVerificationServiceConfig {
    rpcSource: EVMTransactionSources;
}

export abstract class EVMTransactionVerifierServiceBase {
    store: AttestationDefinitionStore;
    exampleData: ExampleData<EVMTransaction_RequestNoMic, EVMTransaction_Request, EVMTransaction_Response>;

    web3Provider: JsonRpcProvider;
    source: EVMTransactionSources;
    isTestnet: boolean;

    constructor(
        protected configService: ConfigService<IConfig>,
        config: IVerificationServiceConfig,
    ) {
        this.store = new AttestationDefinitionStore("type-definitions");
        this.exampleData = JSON.parse(readFileSync("src/example-data/EVMTransaction.json", "utf8"));
        const rpcConfig = this.configService.getOrThrow<IGetRPCSource>("getRPCSource");
        this.source = config.rpcSource;
        this.web3Provider = new ethers.JsonRpcProvider(rpcConfig(config.rpcSource));
        this.isTestnet = this.configService.getOrThrow<boolean>("isTestnet");
    }

    async verifyRequestInternal(request: EVMTransaction_Request | EVMTransaction_RequestNoMic): Promise<AttestationResponseDTO_EVMTransaction_Response> {
        if (
            request.attestationType !== encodeAttestationName("EVMTransaction") ||
            request.sourceId !== encodeAttestationName((this.isTestnet ? "test" : "") + this.source)
        ) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: `Attestation type and source id combination not supported: (${request.attestationType}, ${
                        request.sourceId
                    }). This source supports attestation type 'EVMTransaction' (${encodeAttestationName("EVMTransaction")}) and source id '${
                        (this.isTestnet ? "test" : "") + this.source
                    }' (${encodeAttestationName((this.isTestnet ? "test" : "") + this.source)}).`,
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const fixedRequest = {
            ...request,
        } as EVMTransaction_Request;
        if (!fixedRequest.messageIntegrityCode) {
            fixedRequest.messageIntegrityCode = ZERO_BYTES_32;
        }

        return this.verifyRequest(fixedRequest);
    }

    async verifyRequest(fixedRequest: EVMTransaction_Request): Promise<AttestationResponseDTO_EVMTransaction_Response> {
        const responseDTO = await verifyEVMTransactionRequest(fixedRequest, this.web3Provider);
        return responseDTO;
    }

    public async verifyEncodedRequest(abiEncodedRequest: string): Promise<AttestationResponseDTO_EVMTransaction_Response> {
        const requestJSON = this.store.parseRequest<EVMTransaction_Request>(abiEncodedRequest);
        const response = await this.verifyRequestInternal(requestJSON);
        return response;
    }

    public async verifyEncodedRequestFDC(abiEncodedRequest: string): Promise<AttestationResponseDTO_EVMTransaction_ResponseEncoded> {
        const requestJSON = this.store.parseRequest<EVMTransaction_Request>(abiEncodedRequest);
        const response = await this.verifyRequestInternal(requestJSON);
        if (response.status !== AttestationResponseStatus.VALID || !response.response) {
            return {
                status: response.status,
            };
        }
        const encoded = this.store.encodeResponse(response.response);
        return {
            status: response.status,
            abiEncodedResponse: encoded,
        };
    }

    public async prepareResponse(request: EVMTransaction_RequestNoMic): Promise<AttestationResponseDTO_EVMTransaction_Response> {
        const response = await this.verifyRequestInternal(request);
        return response;
    }

    public async mic(request: EVMTransaction_RequestNoMic): Promise<MicResponse> {
        const result = await this.verifyRequestInternal(request);
        if (result.status !== AttestationResponseStatus.VALID) {
            return new MicResponse({ status: result.status });
        }
        const response = result.response;
        if (!response) return new MicResponse({ status: result.status });
        return new MicResponse({
            status: AttestationResponseStatus.VALID,
            messageIntegrityCode: this.store.attestationResponseHash<EVMTransaction_Response>(response, MIC_SALT),
        });
    }

    public async prepareRequest(request: EVMTransaction_RequestNoMic): Promise<EncodedRequestResponse> {
        const result = await this.verifyRequestInternal(request);
        if (result.status !== AttestationResponseStatus.VALID) {
            return new EncodedRequestResponse({ status: result.status });
        }
        const response = result.response;

        if (!response) return new EncodedRequestResponse({ status: result.status });
        const newRequest = {
            ...request,
            messageIntegrityCode: this.store.attestationResponseHash<EVMTransaction_Response>(response, MIC_SALT)!,
        } as EVMTransaction_Request;

        return new EncodedRequestResponse({
            status: AttestationResponseStatus.VALID,
            abiEncodedRequest: this.store.encodeRequest(newRequest),
        });
    }
}
