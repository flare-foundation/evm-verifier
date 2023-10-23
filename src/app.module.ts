import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiKeyStrategy } from "./auth/apikey.strategy";
import { AuthModule } from "./auth/auth.module";
import { AuthService } from "./auth/auth.service";
import configuration from "./config/configuration";
import { ETHEVMTransactionVerifierController } from "./controller/eth/eth-evm-transaction-verifier.controller";
import { FLREVMTransactionVerifierController } from "./controller/flr/flr-evm-transaction-verifier.controller";
import { ETHEVMTransactionVerifierService } from "./service/eth/eth-evm-transaction-verifier.service";
import { FLREVMTransactionVerifierService } from "./service/flr/flr-evm-transaction-verifier.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
        }),
        AuthModule,
    ],
    controllers: [ETHEVMTransactionVerifierController, FLREVMTransactionVerifierController],
    providers: [ApiKeyStrategy, AuthService, ETHEVMTransactionVerifierService, FLREVMTransactionVerifierService],
})
export class AppModule {}
