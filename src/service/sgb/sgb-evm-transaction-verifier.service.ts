import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JsonRpcProvider, ethers } from "ethers";
import { readFileSync } from "fs";
import { IConfig } from "../../config/configuration";
import {
    AttestationResponseDTO_EVMTransaction_Response,
    EVMTransaction_Request,
    EVMTransaction_RequestNoMic,
    EVMTransaction_Response,
} from "../../dto/EVMTransaction.dto";
import { EncodedRequestResponse, MicResponse } from "../../dto/generic.dto";
import { AttestationDefinitionStore } from "../../external-libs/ts/AttestationDefinitionStore";
import { AttestationResponseStatus } from "../../external-libs/ts/AttestationResponse";
import { ExampleData } from "../../external-libs/ts/interfaces";
import { MIC_SALT, ZERO_BYTES_32, encodeAttestationName } from "../../external-libs/ts/utils";
import { verifyEVMTransactionRequest } from "../../verification/verification";

@Injectable()
export class SGBEVMTransactionVerifierService {
    store!: AttestationDefinitionStore;
    exampleData!: ExampleData<EVMTransaction_RequestNoMic, EVMTransaction_Request, EVMTransaction_Response>;

    //-$$$<start-constructor> Start of custom code section. Do not change this comment.

    web3Provider!: JsonRpcProvider;

    // Add additional class members here.
    // Augment the constructor with additional (injected) parameters, if required. Update the constructor code.
    constructor(private configService: ConfigService<IConfig>) {
        this.store = new AttestationDefinitionStore("type-definitions");
        this.exampleData = JSON.parse(readFileSync("src/example-data/EVMTransaction.json", "utf8"));

        this.web3Provider = new ethers.JsonRpcProvider(this.configService.get("rpcSGB"));
    }

    //-$$$<end-constructor> End of custom code section. Do not change this comment.

    async verifyRequestInternal(request: EVMTransaction_Request | EVMTransaction_RequestNoMic): Promise<AttestationResponseDTO_EVMTransaction_Response> {
        if (
            request.attestationType !== encodeAttestationName("EVMTransaction") ||
            request.sourceId !== encodeAttestationName((process.env.TESTNET ? "test" : "") + "SGB")
        ) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: `Attestation type and source id combination not supported: (${request.attestationType}, ${
                        request.sourceId
                    }). This source supports attestation type 'EVMTransaction' (${encodeAttestationName("EVMTransaction")}) and source id '${
                        (process.env.TESTNET ? "test" : "") + "SGB"
                    }' (${encodeAttestationName((process.env.TESTNET ? "test" : "") + "SGB")}).`,
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
        //-$$$<start-verifyRequest> Start of custom code section. Do not change this comment.

        const responseDTO = await verifyEVMTransactionRequest(fixedRequest, this.web3Provider);
        return responseDTO;

        //-$$$<end-verifyRequest> End of custom code section. Do not change this comment.
    }

    public async verifyEncodedRequest(abiEncodedRequest: string): Promise<AttestationResponseDTO_EVMTransaction_Response> {
        const requestJSON = this.store.parseRequest<EVMTransaction_Request>(abiEncodedRequest);
        const response = await this.verifyRequestInternal(requestJSON);
        return response;
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
