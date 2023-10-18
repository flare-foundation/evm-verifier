import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiKeyStrategy } from "./auth/apikey.strategy";
import { AuthModule } from "./auth/auth.module";
import { AuthService } from "./auth/auth.service";
import configuration from "./config/configuration";
import { ETHEVMTransactionVerifierController } from "./controller/eth/eth-evm-transaction-verifier.controller";
import { ETHEVMTransactionVerifierService } from "./service/eth/eth-evm-transaction-verifier.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
        }),
        AuthModule,
    ],
    controllers: [ETHEVMTransactionVerifierController],
    providers: [ApiKeyStrategy, AuthService, ETHEVMTransactionVerifierService],
})
export class AppModule {}
