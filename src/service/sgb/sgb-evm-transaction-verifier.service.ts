import { Injectable } from "@nestjs/common";
import { EVMTransactionVerifierServiceBase, IVerificationServiceConfig } from "../evm-transaction-verification-base.service";
import { ConfigService } from "@nestjs/config";
import { IConfig } from "../../config/configuration";

@Injectable()
export class SGBEVMTransactionVerifierService extends EVMTransactionVerifierServiceBase {
    constructor(protected configService: ConfigService<IConfig>) {
        const VerificationServiceConfig: IVerificationServiceConfig = {
            rpcSource: "SGB",
        };
        super(configService, VerificationServiceConfig);
    }
}
