import { Injectable } from "@nestjs/common";
import { readFileSync } from "fs";
import { EVMTransaction_Request, EVMTransaction_RequestNoMic, EVMTransaction_Response } from "../dto/EVMTransaction.dto";
import { AttestationDefinitionStore } from "../external-libs/ts/AttestationDefinitionStore";
import { AttestationResponse, AttestationResponseStatus } from "../external-libs/ts/AttestationResponse";
import { ExampleData } from "../external-libs/ts/interfaces";
import { MIC_SALT } from "../external-libs/ts/utils";

@Injectable()
export class EVMTransactionVerifierService {
    store!: AttestationDefinitionStore;
    exampleData!: ExampleData<EVMTransaction_RequestNoMic, EVMTransaction_Request, EVMTransaction_Response>;

    //-$$$<start-constructor> Start of custom code section. Do not change this comment.

    constructor() {
        this.store = new AttestationDefinitionStore("type-definitions");
        this.exampleData = JSON.parse(readFileSync("src/example-data/EVMTransaction.json", "utf8"));
    }

    //-$$$<end-constructor> End of custom code section. Do not change this comment.

    public async verifyEncodedRequest(abiEncodedRequest: string): Promise<AttestationResponse<EVMTransaction_Response>> {
        const requestJSON = this.store.parseRequest<EVMTransaction_Request>(abiEncodedRequest);
        console.dir(requestJSON, { depth: null });

        //-$$$<start-verifyEncodedRequest> Start of custom code section. Do not change this comment.

        // PUT YOUR CUSTOM CODE HERE

        //-$$$<end-verifyEncodedRequest> End of custom code section. Do not change this comment.

        // Example of response body. Delete this example and provide value for variable 'response' in the custom code section above.
        const response: AttestationResponse<EVMTransaction_Response> = {
            status: AttestationResponseStatus.VALID,
            response: this.exampleData.response,
        };

        return response;
    }

    public async prepareResponse(request: EVMTransaction_RequestNoMic): Promise<AttestationResponse<EVMTransaction_Response>> {
        console.dir(request, { depth: null });

        //-$$$<start-prepareResponse> Start of custom code section. Do not change this comment.

        // PUT YOUR CUSTOM CODE HERE

        //-$$$<end-prepareResponse> End of custom code section. Do not change this comment.

        // Example of response body. Delete this example and provide value for variable 'response' in the custom code section above.
        const response: AttestationResponse<EVMTransaction_Response> = {
            status: AttestationResponseStatus.VALID,
            response: {
                ...this.exampleData.response,
                ...request,
            } as EVMTransaction_Response,
        };

        return response;
    }

    public async mic(request: EVMTransaction_RequestNoMic): Promise<string | undefined> {
        console.dir(request, { depth: null });

        //-$$$<start-mic> Start of custom code section. Do not change this comment.

        // PUT YOUR CUSTOM CODE HERE

        //-$$$<end-mic> End of custom code section. Do not change this comment.

        // Example of response body. Delete this example and provide value for variable 'response' in the custom code section above.
        const response: EVMTransaction_Response = {
            ...this.exampleData.response,
            ...request,
        };

        if (!response) return undefined;
        return this.store.attestationResponseHash<EVMTransaction_Response>(response, MIC_SALT)!;
    }

    public async prepareRequest(request: EVMTransaction_RequestNoMic): Promise<string | undefined> {
        console.dir(request, { depth: null });

        //-$$$<start-prepareRequest> Start of custom code section. Do not change this comment.

        // PUT YOUR CUSTOM CODE HERE

        //-$$$<end-prepareRequest> End of custom code section. Do not change this comment.

        // Example of response body. Delete this example and provide value for variable 'response' in the custom code section above.
        const response: EVMTransaction_Response = {
            ...this.exampleData.response,
            ...request,
        };

        if (!response) return undefined;
        const newRequest = {
            ...request,
            messageIntegrityCode: this.store.attestationResponseHash<EVMTransaction_Response>(response, MIC_SALT)!,
        } as EVMTransaction_Request;

        return this.store.encodeRequest(newRequest);
    }
}
