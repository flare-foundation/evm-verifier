//////////////////////////////////////////////////////////////////////////////////////////
/////// THIS CODE IS AUTOGENERATED. DO NOT CHANGE!!!                             /////////
//////////////////////////////////////////////////////////////////////////////////////////
import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Validate, IsOptional, IsHexadecimal, IsBoolean, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

export namespace TypeTemplate {
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////// CUSTOM VALIDATORS ////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Validator constraint if the given value is a number or 0x-prefixed hexadecimal string.
   */
  @ValidatorConstraint({ name: "unsigned-int", async: false })
  export class IsUnsignedIntLike implements ValidatorConstraintInterface {
    /**
     * Validates if the given value is a string of decimal unsigned number or 0x-prefixed hexadecimal string.
     * @param text
     * @param args
     * @returns
     */
    validate(text: any, args: ValidationArguments) {
      return typeof text === "string" && (/^0x[0-9a-fA-F]+$/i.test(text) || /^[0-9]+$/i.test(text));
    }

    /**
     * Returns the default error message template.
     * @param args
     * @returns
     */
    defaultMessage(args: ValidationArguments) {
      return "($property) value ($value) is not a decimal number in string or 0x-prefixed hexadecimal string";
    }
  }

  /**
   * Validator constraint if the given value is a number or 0x-prefixed hexadecimal string.
   */
  @ValidatorConstraint({ name: "signed-int", async: false })
  export class IsSignedIntLike implements ValidatorConstraintInterface {
    /**
     * Validates if the given value is a number or 0x-prefixed hexadecimal string.
     * @param text
     * @param args
     * @returns
     */
    validate(text: any, args: ValidationArguments) {
      return typeof text === "string" && (/^-?0x[0-9a-fA-F]+$/i.test(text) || /^-?[0-9]+$/i.test(text));
    }

    /**
     * Returns the default error message template.
     * @param args
     * @returns
     */
    defaultMessage(args: ValidationArguments) {
      return "($property) value ($value) is not a signed decimal integer in string or signed 0x-prefixed hexadecimal string";
    }
  }

  /**
   * Validator constraint if the given value is a 0x-prefixed hexadecimal string representing 32 bytes.
   */
  @ValidatorConstraint({ name: "hash-32", async: false })
  export class IsHash32 implements ValidatorConstraintInterface {
    /**
     * Validates if the given value is a 0x-prefixed hexadecimal string representing 32 bytes.
     * @param text
     * @param args
     * @returns
     */
    validate(text: any, args: ValidationArguments) {
      return typeof text === "string" && /^0x[0-9a-f]{64}$/i.test(text);
    }

    /**
     * Returns the default error message template.
     * @param args
     * @returns
     */
    defaultMessage(args: ValidationArguments) {
      return "($property) value ($value) is not 0x-prefixed hexadecimal string representing 32 bytes";
    }
  }

  /**
   * Validator constraint if the given value is an EVM address, hence 0x-prefixed hexadecimal string representing 20 bytes.
   */
  @ValidatorConstraint({ name: "evm-address", async: false })
  export class IsEVMAddress implements ValidatorConstraintInterface {
    /**
     * Validates if the given value is an EVM address, hence 0x-prefixed hexadecimal string representing 20 bytes.
     * @param text
     * @param args
     * @returns
     */
    validate(text: any, args: ValidationArguments) {
      return typeof text === "string" && /^0x[0-9a-f]{40}$/i.test(text);
    }

    /**
     * Returns the default error message template.
     * @param args
     * @returns
     */
    defaultMessage(args: ValidationArguments) {
      return "($property) value ($value) is not 0x-prefixed hexadecimal string representing 20 bytes (EVM address)";
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////// DTOs /////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  export class AdditionalSubstruct1 {
    constructor(params: Required<AdditionalSubstruct1>) {
      Object.assign(this, params);
    }

    /**
     * description*
     */
    @IsHexadecimal()
    @ApiProperty({ description: `description*` })
    templateStructField!: string;
  }
  export class AdditionalSubstruct2 {
    constructor(params: Required<AdditionalSubstruct2>) {
      Object.assign(this, params);
    }

    /**
     * description*
     */
    @IsHexadecimal()
    @ApiProperty({ description: `description*` })
    templateStructField!: string;
  }
  export class ResponseBody {
    constructor(params: Required<ResponseBody>) {
      Object.assign(this, params);
    }

    /**
     * description*
     */
    @IsHexadecimal()
    @ApiProperty({ description: `description*` })
    templateResponseField!: string;
  }
  export class RequestBody {
    constructor(params: Required<RequestBody>) {
      Object.assign(this, params);
    }

    /**
     * description*
     */
    @IsHexadecimal()
    @ApiProperty({ description: `description*` })
    templateRequestField!: string;
  }
  export class Request {
    constructor(params: Required<Request>) {
      Object.assign(this, params);
    }

    /**
     * Id of the attestation type.
     */
    @IsHexadecimal()
    @ApiProperty({ description: `Id of the attestation type.` })
    attestationType!: string;

    /**
     * Data source id as defined [here](enums.md).
     */
    @IsHexadecimal()
    @ApiProperty({ description: `Data source id as defined [here](enums.md).` })
    sourceId!: string;

    /**
     * `MessageIntegrityCode` that is derived from the expected response as defined [here](../attestation-objects/MIC.md#message-integrity-code).
     */
    @IsHexadecimal()
    @ApiProperty({
      description: `'MessageIntegrityCode' that is derived from the expected response as defined [here](../attestation-objects/MIC.md#message-integrity-code).`,
    })
    messageIntegrityCode!: string;

    /**
     * Data defining the request. Type (struct) and interpretation is determined by the `attestationType`.
     */
    @ApiProperty({ description: `Data defining the request. Type (struct) and interpretation is determined by the 'attestationType'.` })
    requestBody!: RequestBody;
  }
  export class Response {
    constructor(params: Required<Response>) {
      Object.assign(this, params);
    }

    /**
     * Extracted from the request.
     */
    @IsHexadecimal()
    @ApiProperty({ description: `Extracted from the request.` })
    attestationType!: string;

    /**
     * Extracted from the request.
     */
    @IsHexadecimal()
    @ApiProperty({ description: `Extracted from the request.` })
    sourceId!: string;

    /**
     * The id of the state connector round in which the request was considered. This is a security measure to prevent collision of attestation hashes.
     */
    @Validate(IsUnsignedIntLike)
    @ApiProperty({
      description: `The id of the state connector round in which the request was considered. This is a security measure to prevent collision of attestation hashes.`,
    })
    votingRound!: string;

    /**
     * The lowest timestamp used to generate the response.
     */
    @Validate(IsUnsignedIntLike)
    @ApiProperty({ description: `The lowest timestamp used to generate the response.` })
    lowestUsedTimestamp!: string;

    /**
     * Extracted from the request.
     */
    @ApiProperty({ description: `Extracted from the request.` })
    requestBody!: RequestBody;

    /**
     * Data defining the response. The verification rules for the construction of the response body and the type are defined per specific `attestationType`.
     */
    @ApiProperty({
      description: `Data defining the response. The verification rules for the construction of the response body and the type are defined per specific 'attestationType'.`,
    })
    responseBody!: ResponseBody;
  }
  export class Proof {
    constructor(params: Required<Proof>) {
      Object.assign(this, params);
    }

    /**
     * Merkle proof corresponding to the attestation response.
     */
    @ApiProperty({ description: `Merkle proof corresponding to the attestation response.` })
    merkleProof!: string[];

    /**
     * Attestation response.
     */
    @ApiProperty({ description: `Attestation response.` })
    data!: Response;
  }

  export class RequestNoMic extends OmitType(Request, ["messageIntegrityCode"] as const) {}
}
