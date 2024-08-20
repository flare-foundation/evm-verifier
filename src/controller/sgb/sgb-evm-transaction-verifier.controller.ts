import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EVMTransactionVerifierControllerBase } from "../evm-transaction-verifier-base.controller";
import { SGBEVMTransactionVerifierService } from "../../service/sgb/sgb-evm-transaction-verifier.service";

@ApiTags("EVMTransaction", "SGB")
@Controller("sgb/EVMTransaction")
export class SGBEVMTransactionVerifierController extends EVMTransactionVerifierControllerBase {
    constructor(protected readonly verifierService: SGBEVMTransactionVerifierService) {
        super();
    }
}
