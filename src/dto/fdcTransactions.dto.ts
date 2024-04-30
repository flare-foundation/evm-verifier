/**
 * Attestation status
 */
export enum AttestationResponseStatus {
    /**
     * Attestation request is valid.
     */
    VALID = "VALID",
    /**
     * Attestation request is invalid.
     */
    INVALID = "INVALID",
    /**
     * Attestation request cannot be confirmed neither rejected by the verifier at the moment.
     */
    INDETERMINATE = "INDETERMINATE",
}

/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseDTO_EVMTransaction_ResponseEncoded {
    constructor(params: Required<AttestationResponseDTO_EVMTransaction_ResponseEncoded>) {
        Object.assign(this, params);
    }

    status: AttestationResponseStatus;

    /**
     * Abi encoded request object see this for more info: https://gitlab.com/flarenetwork/state-connector-protocol/-/blob/main/attestation-objects/request-encoding-decoding.md
     */
    abiEncodedResponse?: string;
}
