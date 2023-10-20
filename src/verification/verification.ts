import { JsonRpcProvider, ethers } from "ethers";
import {
    EVMTransaction_Event,
    EVMTransaction_Request,
    EVMTransaction_RequestNoMic,
    EVMTransaction_Response,
    EVMTransaction_ResponseBody,
} from "../dto/EVMTransaction.dto";
import { AttestationResponseDTO } from "../dto/generic.dto";
import { AttestationResponseStatus } from "../external-libs/ts/AttestationResponse";
import { ZERO_BYTES_20 } from "../external-libs/ts/utils";

/**
 * Verifies the EVMTransaction attestation request for a EVMTransaction request on any EVM chain.
 * The connection to the chain should be provided through the web3Provider parameter.
 * @param request
 * @param web3Provider
 * @returns
 */
export async function verifyEVMTransactionRequest(
    request: EVMTransaction_Request | EVMTransaction_RequestNoMic,
    web3Provider: JsonRpcProvider,
): Promise<AttestationResponseDTO<EVMTransaction_Response>> {
    // May except. Error is thrown
    const [blockNumber, txInfo, txReceipt] = await Promise.all([
        web3Provider.getBlockNumber(),
        web3Provider.getTransaction(request.requestBody.transactionHash),
        web3Provider.getTransactionReceipt(request.requestBody.transactionHash),
    ]);
    if (!txInfo || !txReceipt) {
        return {
            status: AttestationResponseStatus.INVALID,
        };
    }
    if (BigInt(blockNumber) - BigInt(txInfo.blockNumber!) + BigInt(1) < BigInt(request.requestBody.requiredConfirmations)) {
        return {
            status: AttestationResponseStatus.INVALID,
        };
    }
    const block = await web3Provider.getBlock(txInfo.blockHash!);
    if (!block) {
        return {
            status: AttestationResponseStatus.INVALID,
        };
    }
    const events: EVMTransaction_Event[] = [];
    let logs: ethers.Log[] = [];
    if (request.requestBody.listEvents) {
        if (request.requestBody.logIndices.length > 0 && 50 > request.requestBody.logIndices.length) {
            const firstIndexInTx = txReceipt.logs[0].index;

            for (const i of request.requestBody.logIndices) {
                const index = parseInt(i);
                if (isNaN(index) || index < firstIndexInTx || index >= txReceipt.logs.length + firstIndexInTx) {
                    return {
                        status: AttestationResponseStatus.INVALID,
                    };
                }
                logs.push(txReceipt.logs[index - firstIndexInTx]);
            }
        } else if (request.requestBody.logIndices.length == 0) {
            logs = [...txReceipt.logs];
            logs.splice(50);
        } else {
            return {
                status: AttestationResponseStatus.INVALID,
            };
        }
    } else if (request.requestBody.logIndices.length > 0) {
        return {
            status: AttestationResponseStatus.INVALID,
        };
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
            requestBody: request.requestBody,
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
