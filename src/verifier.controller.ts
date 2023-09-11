/////////////////
// DO NOT EDIT //
/////////////////

import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from './auth/apikey.guard';
import { EncodedRequestBody } from './dto/encoded-request.dto';
import { AttRequestNoMic } from './dto/request-no-mic';
import { AttResponse } from './dto/response.dto';
import { VerifierService } from './verifier.service';

@Controller('verifier/eth')
@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('X-API-KEY')
export class VerifierController {
    constructor(private readonly verifierService: VerifierService) {}

    /**
     *
     * Tries to verify encoded attestation request without checking message integrity code, and if successful it returns response.
     * @param verifierBody
     * @returns
     */
    @HttpCode(200)
    @Post()
    async verify(@Body() body: EncodedRequestBody): Promise<AttResponse> {
        return this.verifierService.verifyEncodedRequest(body);
    }

    /**
     * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful it returns response.
     * @param prepareResponseBody
     * @returns
     */
    @HttpCode(200)
    @Post('prepareResponse')
    async prepareResponse(@Body() body: AttRequestNoMic): Promise<AttResponse> {
        return this.verifierService.prepareResponse(body);
    }

    /**
     * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful, it returns the correct message integrity code.
     * @param body
     */
    @HttpCode(200)
    @Post('mic')
    async mic(@Body() body: AttRequestNoMic): Promise<string> {
        return this.verifierService.mic(body);
    }

    /**
     * Tries to verify attestation request (given in JSON) without checking message integrity code.
     * If successful, it returns the encoding of the attestation request with the correct message integrity code, which can be directly submitted to the State Connector contract.
     * @param body
     */
    @HttpCode(200)
    @Post('prepareRequest')
    async prepareRequest(@Body() body: AttRequestNoMic): Promise<EncodedRequestBody> {
        return this.verifierService.prepareRequest(body);
    }
}
