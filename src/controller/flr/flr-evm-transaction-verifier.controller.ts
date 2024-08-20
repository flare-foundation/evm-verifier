import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FLREVMTransactionVerifierService } from "../../service/flr/flr-evm-transaction-verifier.service";
import { EVMTransactionVerifierControllerBase } from "../evm-transaction-verifier-base.controller";

@ApiTags("EVMTransaction", "FLR")
@Controller("flr/EVMTransaction")
export class FLREVMTransactionVerifierController extends EVMTransactionVerifierControllerBase {
    constructor(protected readonly verifierService: FLREVMTransactionVerifierService) {
        super();
    }
}
