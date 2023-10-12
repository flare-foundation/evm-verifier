import {
    EVMTransaction_Proof,
    EVMTransaction_RequestBody,
    EVMTransaction_RequestNoMic,
    EVMTransaction_Response,
    EVMTransaction_ResponseBody,
} from "../dto/EVMTransaction.dto";
import { MIC_SALT, encodeAttestationName } from "../external-libs/ts/utils";
import { randSol } from "../external-libs/ts/random";
import { AttestationDefinitionStore } from "../external-libs/ts/AttestationDefinitionStore";

const ATTESTATION_TYPE_NAME = "EVMTransaction";

function randomProof(votingRound: number = 1234, sourceId?: string, fullRandom = false): EVMTransaction_Proof {
    const bodies = randomBodies(fullRandom);
    const response = {
        attestationType: encodeAttestationName(ATTESTATION_TYPE_NAME),
        sourceId: encodeAttestationName(sourceId ?? "BTC"),
        votingRound: votingRound.toString(),
        lowestUsedTimestamp: "1234",
        requestBody: bodies.requestBody,
        responseBody: bodies.responseBody,
    } as EVMTransaction_Response;

    const proof = {
        merkleProof: [] as string[],
        data: response,
    } as EVMTransaction_Proof;
    return proof;
}

function randomBodies(fullRandom = false) {
    const requestBody = {
        transactionHash: randSol("bytes32", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        requiredConfirmations: randSol("uint16", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        provideInput: randSol("bool", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        listEvents: randSol("bool", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        logIndices: [
            randSol("uint32", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
            randSol("uint32", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
            randSol("uint32", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        ],
    } as EVMTransaction_RequestBody;

    const responseBody = {
        blockNumber: randSol("uint64", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        timestamp: randSol("uint64", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        sourceAddress: randSol("address", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        isDeployment: randSol("bool", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        receivingAddress: randSol("address", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        value: randSol("uint256", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        input: randSol("bytes", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        status: randSol("uint8", "EVMTransaction" + (fullRandom ? Math.random().toString() : "")),
        events: [
            {
                logIndex: randSol("uint32", "EVMTransaction"),
                emitterAddress: randSol("address", "EVMTransaction"),
                topics: [randSol("bytes32", "EVMTransaction"), randSol("bytes32", "EVMTransaction"), randSol("bytes32", "EVMTransaction")],
                data: randSol("bytes", "EVMTransaction"),
                removed: randSol("bool", "EVMTransaction"),
            },
            {
                logIndex: randSol("uint32", "EVMTransaction"),
                emitterAddress: randSol("address", "EVMTransaction"),
                topics: [randSol("bytes32", "EVMTransaction"), randSol("bytes32", "EVMTransaction"), randSol("bytes32", "EVMTransaction")],
                data: randSol("bytes", "EVMTransaction"),
                removed: randSol("bool", "EVMTransaction"),
            },
            {
                logIndex: randSol("uint32", "EVMTransaction"),
                emitterAddress: randSol("address", "EVMTransaction"),
                topics: [randSol("bytes32", "EVMTransaction"), randSol("bytes32", "EVMTransaction"), randSol("bytes32", "EVMTransaction")],
                data: randSol("bytes", "EVMTransaction"),
                removed: randSol("bool", "EVMTransaction"),
            },
        ],
    } as EVMTransaction_ResponseBody;
    return { requestBody, responseBody };
}

export function randomExample(votingRound: number = 1234, sourceId?: string, fullRandom = false) {
    const store = new AttestationDefinitionStore("type-definitions");
    const proof = randomProof(votingRound, sourceId, fullRandom);
    const requestNoMic = {
        attestationType: proof.data.attestationType,
        sourceId: proof.data.sourceId,
        requestBody: proof.data.requestBody,
    } as EVMTransaction_RequestNoMic;
    const encodedRequestZeroMic = store.encodeRequest(requestNoMic as any);
    const response = proof.data;
    const messageIntegrityCode = store.attestationResponseHash(response, MIC_SALT);
    const request = {
        ...requestNoMic,
        messageIntegrityCode,
    };
    const encodedRequest = store.encodeRequest(request as any);
    return { requestNoMic, response, request, messageIntegrityCode, encodedRequestZeroMic, encodedRequest, proof };
}

export function randomEVMTransactionExample(votingRound: number = 1234, sourceId?: string, fullRandom = false) {
    return randomExample(votingRound, sourceId, fullRandom);
}
