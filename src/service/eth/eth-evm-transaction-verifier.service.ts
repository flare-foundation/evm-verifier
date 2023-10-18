import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JsonRpcProvider, ethers } from "ethers";
import { readFileSync } from "fs";
import { IConfig } from "../../config/configuration";
import {
    EVMTransaction_Event,
    EVMTransaction_Request,
    EVMTransaction_RequestNoMic,
    EVMTransaction_Response,
    EVMTransaction_ResponseBody,
} from "../../dto/EVMTransaction.dto";
import { AttestationResponseDTO } from "../../dto/generic.dto";
import { AttestationDefinitionStore } from "../../external-libs/ts/AttestationDefinitionStore";
import { AttestationResponse, AttestationResponseStatus } from "../../external-libs/ts/AttestationResponse";
import { ExampleData } from "../../external-libs/ts/interfaces";
import { MIC_SALT, ZERO_BYTES_20, ZERO_BYTES_32, encodeAttestationName, serializeBigInts } from "../../external-libs/ts/utils";

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
        const attestationName = "EVMTransaction";
        const sourceId = "ETH";
        const encodedAttestationName = encodeAttestationName(attestationName);
        const encodedSourceId = encodeAttestationName(sourceId);
        if (request.attestationType !== encodedAttestationName || request.sourceId !== encodedSourceId) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: `Attestation type and source id combination not supported: (${request.attestationType}, ${request.sourceId}) supported: encoded(${attestationName})=${encodedAttestationName}, encoded(${sourceId})=${encodedSourceId}`,
                },
                HttpStatus.NOT_FOUND,
                {
                    cause: request,
                },
            );
        }
        // May except. Error is returned
        const [blockNumber, txInfo, txReceipt] = await Promise.all([
            await this.web3Provider.getBlockNumber(),
            await this.web3Provider.getTransaction(request.requestBody.transactionHash),
            await this.web3Provider.getTransactionReceipt(request.requestBody.transactionHash),
        ]);
        if (!txInfo || !txReceipt) {
            return {
                status: AttestationResponseStatus.INVALID,
            };
        }
        if (BigInt(blockNumber) - BigInt(txInfo.blockNumber!) < BigInt(request.requestBody.requiredConfirmations)) {
            return {
                status: AttestationResponseStatus.INVALID,
            };
        }
        const block = await this.web3Provider.getBlock(txInfo.blockHash!);
        if (!block) {
            return {
                status: AttestationResponseStatus.INVALID,
            };
        }
        const events: EVMTransaction_Event[] = [];
        let logs: ethers.Log[] = [];
        if (request.requestBody.listEvents) {
            if (request.requestBody.logIndices.length > 0) {
                for (const i of request.requestBody.logIndices) {
                    const index = parseInt(i);
                    if (isNaN(index) || index < 0 || index >= txReceipt.logs.length) {
                        return {
                            status: AttestationResponseStatus.INVALID,
                        };
                    }
                    logs.push(txReceipt.logs[index]);
                }
            } else {
                logs = [...txReceipt.logs];
            }
        }
        for (const log of logs) {
            const event = new EVMTransaction_Event({
                logIndex: log.index.toString(),
                emitterAddress: log.address,
                topics: [...log.topics],
                data: log.data,
                removed: log.removed ?? false,
            });
            events.push(event);
        }
        return {
            status: AttestationResponseStatus.VALID,
            response: new EVMTransaction_Response({
                attestationType: request.attestationType,
                sourceId: request.sourceId,
                votingRound: "0",
                lowestUsedTimestamp: block.timestamp.toString(),
                requestBody: serializeBigInts(request.requestBody),
                responseBody: new EVMTransaction_ResponseBody({
                    blockNumber: block.number.toString(),
                    timestamp: block.timestamp.toString(),
                    sourceAddress: txInfo.from!,
                    isDeployment: !txInfo.to,
                    receivingAddress: txInfo.to ? txInfo.to : ZERO_BYTES_20,
                    value: txInfo.value.toString(),
                    input: request.requestBody.provideInput ? txInfo.data : "0x00",
                    status: txReceipt.status ? "1" : "0",
                    events,
                }),
            }),
        };
    }

    //-$$$<end-constructor> End of custom code section. Do not change this comment.

    public async verifyEncodedRequest(abiEncodedRequest: string): Promise<AttestationResponse<EVMTransaction_Response>> {
        const requestJSON = this.store.parseRequest<EVMTransaction_Request>(abiEncodedRequest);
        //-$$$<start-verifyEncodedRequest> Start of custom code section. Do not change this comment.

        const response = await this.verifyRequest(requestJSON);

        //-$$$<end-verifyEncodedRequest> End of custom code section. Do not change this comment.

        return response;
    }

    public async prepareResponse(request: EVMTransaction_RequestNoMic): Promise<AttestationResponse<EVMTransaction_Response>> {
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
