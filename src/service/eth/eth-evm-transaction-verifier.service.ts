import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JsonRpcProvider, ethers } from "ethers";
import { readFileSync } from "fs";
import { IConfig } from "../../config/configuration";
import { EVMTransaction_Request, EVMTransaction_RequestNoMic, EVMTransaction_Response } from "../../dto/EVMTransaction.dto";
import { AttestationResponseDTO } from "../../dto/generic.dto";
import { AttestationDefinitionStore } from "../../external-libs/ts/AttestationDefinitionStore";
import { AttestationResponse, AttestationResponseStatus } from "../../external-libs/ts/AttestationResponse";
import { ExampleData } from "../../external-libs/ts/interfaces";
import { MIC_SALT, encodeAttestationName, serializeBigInts } from "../../external-libs/ts/utils";
import { verifyEVMTransactionRequest } from "../../verification/verification";

@Injectable()
export class ETHEVMTransactionVerifierService {
    store!: AttestationDefinitionStore;
    exampleData!: ExampleData<EVMTransaction_RequestNoMic, EVMTransaction_Request, EVMTransaction_Response>;

    //-$$$<start-constructor> Start of custom code section. Do not change this comment.

    web3Provider!: JsonRpcProvider;

    constructor(private configService: ConfigService<IConfig>) {
        this.store = new AttestationDefinitionStore("type-definitions");
        this.exampleData = JSON.parse(readFileSync("src/example-data/EVMTransaction.json", "utf8"));

        this.web3Provider = new ethers.JsonRpcProvider(this.configService.get("rpc"));
    }

    /**
     * Verifies the EVMTransaction attestation request.
     * Returns `undefined` if the attestation cannot be verified.
     * @param request
     */
    async verifyRequest(request: EVMTransaction_Request | EVMTransaction_RequestNoMic): Promise<AttestationResponseDTO<EVMTransaction_Response>> {
        if (request.attestationType !== encodeAttestationName("EVMTransaction") || request.sourceId !== encodeAttestationName("ETH")) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: `Attestation type and source id combination not supported: (${request.attestationType}, ${request.sourceId}). This source supports attestation type 'EVMTransaction' (0x45564d5472616e73616374696f6e000000000000000000000000000000000000) and source id 'ETH' (0x4554480000000000000000000000000000000000000000000000000000000000).`,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const responseDTO = await verifyEVMTransactionRequest(request, this.web3Provider);
        return responseDTO;
    }

    //-$$$<end-constructor> End of custom code section. Do not change this comment.

    public async verifyEncodedRequest(abiEncodedRequest: string): Promise<AttestationResponseDTO<EVMTransaction_Response>> {
        const requestJSON = this.store.parseRequest<EVMTransaction_Request>(abiEncodedRequest);
        //-$$$<start-verifyEncodedRequest> Start of custom code section. Do not change this comment.

        const response = await this.verifyRequest(requestJSON);

        //-$$$<end-verifyEncodedRequest> End of custom code section. Do not change this comment.

        return response;
    }

    public async prepareResponse(request: EVMTransaction_RequestNoMic): Promise<AttestationResponseDTO<EVMTransaction_Response>> {
        //-$$$<start-prepareResponse> Start of custom code section. Do not change this comment.

        const response = await this.verifyRequest(request);

        //-$$$<end-prepareResponse> End of custom code section. Do not change this comment.

        return response;
    }

    public async mic(request: EVMTransaction_RequestNoMic): Promise<string | undefined> {
        //-$$$<start-mic> Start of custom code section. Do not change this comment.

        const result = await this.verifyRequest(request);
        const response = result.response;

        //-$$$<end-mic> End of custom code section. Do not change this comment.

        if (!response) return undefined;
        return this.store.attestationResponseHash<EVMTransaction_Response>(response, MIC_SALT)!;
    }

    public async prepareRequest(request: EVMTransaction_RequestNoMic): Promise<string | undefined> {
        //-$$$<start-prepareRequest> Start of custom code section. Do not change this comment.

        const result = await this.verifyRequest(request);
        const response = result.response;

        //-$$$<end-prepareRequest> End of custom code section. Do not change this comment.

        if (!response) return undefined;
        const newRequest = {
            ...request,
            messageIntegrityCode: this.store.attestationResponseHash<EVMTransaction_Response>(response, MIC_SALT)!,
        } as EVMTransaction_Request;

        return this.store.encodeRequest(newRequest);
    }
}
