import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ETHEvmHealthServiceBase, EvmHealthServiceBase, FLREvmHealthServiceBase, SGBEvmHealthServiceBase } from "../service/health.service";

abstract class BaseHealthController {
    protected abstract healthService: EvmHealthServiceBase;

    /**
     * Gets the state entries from the indexer database.
     * @returns
     */
    @Get("health")
    public async indexerState(): Promise<boolean> {
        return this.healthService.checkHealth();
    }
}

@ApiTags("Health")
@Controller("sgb/")
export class SGBHealthController extends BaseHealthController {
    constructor(protected healthService: SGBEvmHealthServiceBase) {
        super();
    }
}

@ApiTags("Health")
@Controller("flr/")
export class FLRHealthController extends BaseHealthController {
    constructor(protected healthService: FLREvmHealthServiceBase) {
        super();
    }
}

@ApiTags("Health")
@Controller("eth/")
export class ETHHealthController extends BaseHealthController {
    constructor(protected healthService: ETHEvmHealthServiceBase) {
        super();
    }
}
