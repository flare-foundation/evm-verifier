import { Body, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ApiKeyAuthGuard } from "../auth/apikey.guard";
import { AttestationResponseDTO_EVMTransaction_Response, EVMTransaction_RequestNoMic } from "../dto/EVMTransaction.dto";
import { AttestationResponseDTO_EVMTransaction_ResponseEncoded } from "../dto/fdcTransactions.dto";
import { EncodedRequest, EncodedRequestResponse, MicResponse } from "../dto/generic.dto";
import { EVMTransactionVerifierServiceBase } from "../service/evm-transaction-verification-base.service";

@ApiTags("EVMTransaction")
@UseGuards(ApiKeyAuthGuard)
@ApiSecurity("X-API-KEY")
export abstract class EVMTransactionVerifierControllerBase {
    protected readonly verifierService: EVMTransactionVerifierServiceBase;

    /**
     *
     * Tries to verify encoded attestation request without checking message integrity code, and if successful it returns response in json form.
     * @param body
     * @deprecated
     * @returns json of AttestationResponse
     */
    @HttpCode(200)
    @Post()
    async verify(@Body() body: EncodedRequest): Promise<AttestationResponseDTO_EVMTransaction_Response> {
        return this.verifierService.verifyEncodedRequest(body.abiEncodedRequest!);
    }

    /**
     * Tries to verify encoded attestation request without checking message integrity code, and if successful it returns response in abi encoded form.
     * @param body
     * @returns abi encoded AttestationResponse
     */
    @HttpCode(200)
    @Post("verifyFDC")
    async verifyFDC(@Body() body: EncodedRequest): Promise<AttestationResponseDTO_EVMTransaction_ResponseEncoded> {
        return this.verifierService.verifyEncodedRequestFDC(body.abiEncodedRequest!);
    }

    /**
     * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful it returns response.
     * @param prepareResponseBody
     * @returns
     */
    @HttpCode(200)
    @Post("prepareResponse")
    async prepareResponse(@Body() body: EVMTransaction_RequestNoMic): Promise<AttestationResponseDTO_EVMTransaction_Response> {
        return this.verifierService.prepareResponse(body);
    }

    /**
     * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful, it returns the correct message integrity code.
     * @param body
     */
    @HttpCode(200)
    @Post("mic")
    async mic(@Body() body: EVMTransaction_RequestNoMic): Promise<MicResponse> {
        return this.verifierService.mic(body);
    }

    /**
     * Tries to verify attestation request (given in JSON) without checking message integrity code.
     * If successful, it returns the encoding of the attestation request with the correct message integrity code, which can be directly submitted to the State Connector contract.
     * @param body
     */
    @HttpCode(200)
    @Post("prepareRequest")
    async prepareRequest(@Body() body: EVMTransaction_RequestNoMic): Promise<EncodedRequestResponse> {
        return this.verifierService.prepareRequest(body);
    }
}
