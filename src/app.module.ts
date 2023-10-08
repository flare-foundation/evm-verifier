import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiKeyStrategy } from "./auth/apikey.strategy";
import { AuthModule } from "./auth/auth.module";
import { AuthService } from "./auth/auth.service";
import configuration from "./config/configuration";
import { EVMTransactionVerifierController } from "./controller/evm-transaction-verifier.controller";
import { EVMTransactionVerifierService } from "./service/evm-transaction-verifier.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
        }),
        AuthModule,
    ],
    controllers: [EVMTransactionVerifierController],
    providers: [ApiKeyStrategy, AuthService, EVMTransactionVerifierService],
})
export class AppModule {}
