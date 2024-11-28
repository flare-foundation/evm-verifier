import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ethers, JsonRpcProvider } from "ethers";
import { EVMTransactionSources, IConfig, IGetRPCSource } from "../config/configuration";
import { IVerificationServiceConfig } from "./evm-transaction-verification-base.service";

export abstract class EvmHealthServiceBase {
    web3Provider: JsonRpcProvider;
    source: EVMTransactionSources;
    isTestnet: boolean;

    constructor(
        protected configService: ConfigService<IConfig>,
        config: IVerificationServiceConfig,
    ) {
        const rpcConfig = this.configService.getOrThrow<IGetRPCSource>("getRPCSource");
        this.source = config.rpcSource;
        this.web3Provider = new ethers.JsonRpcProvider(rpcConfig(config.rpcSource));
        this.isTestnet = this.configService.getOrThrow<boolean>("isTestnet");
    }

    /**
     * Checks the health of the EVM transaction verifier service.
     * - checks underlying node connection is healthy
     */
    async checkHealth(): Promise<boolean> {
        return this.checkHealthBlockNumber();
    }

    private async checkHealthBlockNumber(): Promise<boolean> {
        try {
            const blockNum = await this.web3Provider.getBlockNumber();
            if (blockNum > 0) {
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Error checking health for ${this.source} node: ${error}`);
            return false;
        }
    }
}

@Injectable()
export class SGBEvmHealthServiceBase extends EvmHealthServiceBase {
    constructor(protected configService: ConfigService<IConfig>) {
        const VerificationServiceConfig: IVerificationServiceConfig = {
            rpcSource: "SGB",
        };
        super(configService, VerificationServiceConfig);
    }
}

@Injectable()
export class FLREvmHealthServiceBase extends EvmHealthServiceBase {
    constructor(protected configService: ConfigService<IConfig>) {
        const VerificationServiceConfig: IVerificationServiceConfig = {
            rpcSource: "FLR",
        };
        super(configService, VerificationServiceConfig);
    }
}

@Injectable()
export class ETHEvmHealthServiceBase extends EvmHealthServiceBase {
    constructor(protected configService: ConfigService<IConfig>) {
        const VerificationServiceConfig: IVerificationServiceConfig = {
            rpcSource: "ETH",
        };
        super(configService, VerificationServiceConfig);
    }
}
