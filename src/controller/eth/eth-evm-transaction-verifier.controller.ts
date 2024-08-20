import { ApiTags } from "@nestjs/swagger";
import { ETHEVMTransactionVerifierService } from "../../service/eth/eth-evm-transaction-verifier.service";
import { EVMTransactionVerifierControllerBase } from "../evm-transaction-verifier-base.controller";
import { Controller } from "@nestjs/common";

@ApiTags("EVMTransaction", "ETH")
@Controller("eth/EVMTransaction")
export class ETHEVMTransactionVerifierController extends EVMTransactionVerifierControllerBase {
    constructor(protected readonly verifierService: ETHEVMTransactionVerifierService) {
        super();
    }
}
