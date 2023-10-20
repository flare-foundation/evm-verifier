import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ApiKeyStrategy } from "../auth/apikey.strategy";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";
import configuration from "../config/configuration";
import { ETHEVMTransactionVerifierController } from "../controller/eth/eth-evm-transaction-verifier.controller";
import { AttestationResponseStatus } from "../external-libs/ts/AttestationResponse";
import { ETHEVMTransactionVerifierService } from "../service/eth/eth-evm-transaction-verifier.service";

//transactions on flare chain
const request = {
    attestationType: "0x45564d5472616e73616374696f6e000000000000000000000000000000000000",
    sourceId: "0x4554480000000000000000000000000000000000000000000000000000000000",
    requestBody: {
        transactionHash: "0xd71d5dd7ebb91ba7bd9d943973e3066666db430e56a34b225279872869fbeaf5",
        requiredConfirmations: "1",
        provideInput: true,
        listEvents: false,
        logIndices: ["0", "1", "2"],
    },
};

const request2 = {
    attestationType: "0x45564d5472616e73616374696f6e000000000000000000000000000000000000",
    sourceId: "0x4554480000000000000000000000000000000000000000000000000000000000",
    requestBody: {
        transactionHash: "0xc119e71b540950c6e4f73814d34b5e214c3907707354796acca75cd4a84d1439",
        requiredConfirmations: "1",
        provideInput: false,
        listEvents: true,
        logIndices: ["0", "1", "2"],
    },
};

const requestDeploy = {
    attestationType: "0x45564d5472616e73616374696f6e000000000000000000000000000000000000",
    sourceId: "0x4554480000000000000000000000000000000000000000000000000000000000",
    requestBody: {
        transactionHash: "0xaf687bd9ddde8a5116e2fd82006816be45ea16d76afafd3bf8ea4f89f2bd5eb8",
        requiredConfirmations: "1",
        provideInput: false,
        listEvents: true,
        logIndices: [],
    },
};

describe("Verification correctness", () => {
    let appController: ETHEVMTransactionVerifierController;

    beforeAll(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [configuration],
                    isGlobal: true,
                }),
                AuthModule,
            ],
            controllers: [ETHEVMTransactionVerifierController],
            providers: [ApiKeyStrategy, AuthService, ETHEVMTransactionVerifierService],
        }).compile();

        appController = app.get<ETHEVMTransactionVerifierController>(ETHEVMTransactionVerifierController);
    });

    test("should not verify the request with indices and list events false", async function () {
        const res = await appController.prepareResponse(request);
        expect(res.status).toBe(AttestationResponseStatus.INVALID);
    });

    test("should list all events if so specified ", async function () {
        request.requestBody.listEvents = true;
        request.requestBody.logIndices = [];

        const res = await appController.prepareResponse(request);
        expect(res.status).toBe(AttestationResponseStatus.VALID);
        expect(res.response).toBeDefined();
        expect(res.response?.responseBody.events.length).toBe(24);
    });

    test("should not verify if non-existent index", async function () {
        request.requestBody.listEvents = true;
        request.requestBody.logIndices = ["50"];

        const res = await appController.prepareResponse(request);
        expect(res.status).toBe(AttestationResponseStatus.INVALID);
    });

    test("should sort events according to logIndices", async function () {
        request.requestBody.listEvents = true;
        request.requestBody.logIndices = ["2", "17", "3", "1", "3"];

        const res = await appController.prepareResponse(request);

        expect(res.status).toBe(AttestationResponseStatus.VALID);

        expect(res.response?.responseBody.events[0].logIndex).toBe("2");
        expect(res.response?.responseBody.events[1].logIndex).toBe("17");
        expect(res.response?.responseBody.events[4].logIndex).toBe("3");
    });

    test("should reject verify non-existent transaction", async function () {
        request.requestBody.listEvents = false;
        request.requestBody.logIndices = [];
        request.requestBody.transactionHash = "0xc71d5dd7ebb91ba7bd9d943973e3066666db430e56a34b225279872869fbeaf5";

        const res = await appController.prepareResponse(request);
        expect(res.status).toBe(AttestationResponseStatus.INVALID);
    });

    test("should reject faulty indexes", async function () {
        const res = await appController.prepareResponse(request2);
        expect(res.status).toBe(AttestationResponseStatus.INVALID);
    });

    test("should confirm a valid request", async function () {
        request2.requestBody.logIndices = ["43", "61"];
        const res = await appController.prepareResponse(request2);
        expect(res.status).toBe(AttestationResponseStatus.VALID);
        expect(res.response).toBeDefined();
        expect(res.response?.responseBody.events.length).toBe(2);
        expect(res.response?.responseBody.isDeployment).toBe(false);
    });

    test("should confirm contract deployment", async function () {
        const res = await appController.prepareResponse(requestDeploy);
        expect(res.status).toBe(AttestationResponseStatus.VALID);
        expect(res.response).toBeDefined();
        expect(res.response?.responseBody.isDeployment).toBe(true);
    });
});
