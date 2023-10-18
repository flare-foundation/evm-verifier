import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ApiKeyStrategy } from "../../auth/apikey.strategy";
import { AuthModule } from "../../auth/auth.module";
import { AuthService } from "../../auth/auth.service";
import configuration from "../../config/configuration";
import { ETHEVMTransactionVerifierService } from "../../service/eth/eth-evm-transaction-verifier.service";
import { ETHEVMTransactionVerifierController } from "./eth-evm-transaction-verifier.controller";

const EXAMPLE_ENCODED_REQUEST =
    "0x45564d5472616e73616374696f6e000000000000000000000000000000000000455448000000000000000000000000000000000000000000000000000000000087e8d91c3d07630fe2bf9b85c36d85cfe2d03ba5e63ac054c22ccb0110bebd310000000000000000000000000000000000000000000000000000000000000020e1ad057e71ac82cd2eaaee0dc8700a2c1b6cff4f295a7674b9e97a5f8dd9b51c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000";

const EXAMPLE_REQUEST_NOMIC = {
    attestationType: "0x45564d5472616e73616374696f6e000000000000000000000000000000000000",
    sourceId: "0x4554480000000000000000000000000000000000000000000000000000000000",
    requestBody: {
        transactionHash: "0xe1ad057e71ac82cd2eaaee0dc8700a2c1b6cff4f295a7674b9e97a5f8dd9b51c",
        requiredConfirmations: "1",
        provideInput: true,
        listEvents: true,
        logIndices: ["0"],
    },
};

const EXAMPLE_RESPONSE = {
    status: "VALID",
    response: {
        attestationType: "0x45564d5472616e73616374696f6e000000000000000000000000000000000000",
        sourceId: "0x4554480000000000000000000000000000000000000000000000000000000000",
        votingRound: "0",
        lowestUsedTimestamp: "1696806248",
        requestBody: {
            transactionHash: "0xe1ad057e71ac82cd2eaaee0dc8700a2c1b6cff4f295a7674b9e97a5f8dd9b51c",
            requiredConfirmations: "1",
            provideInput: true,
            listEvents: true,
            logIndices: ["0"],
        },
        responseBody: {
            blockNumber: "13783961",
            timestamp: "1696806248",
            sourceAddress: "0x5E2aFfA528DB55feE8cf8cCC41d0A5bb8BaCedC3",
            isDeployment: false,
            receivingAddress: "0x1000000000000000000000000000000000000003",
            value: "0",
            input: "0x8fc6f6670000000000000000000000000000000000000000000000000000000000034fc578e8ebe068ee167ef3b647b32c53cbee1178b1da99f51574d3038371951da8bf",
            status: "1",
            events: [
                {
                    logIndex: "0",
                    emitterAddress: "0x1000000000000000000000000000000000000003",
                    removed: false,
                    topics: [
                        "0x5e2f64e70eafef31c2f48c8ef140b36406531c36ab0faaede30843202c16f6a8",
                        "0x0000000000000000000000005e2affa528db55fee8cf8ccc41d0a5bb8bacedc3",
                        "0x0000000000000000000000000000000000000000000000000000000000034fc5",
                    ],
                    data: "0x78e8ebe068ee167ef3b647b32c53cbee1178b1da99f51574d3038371951da8bf0000000000000000000000000000000000000000000000000000000065233568",
                },
            ],
        },
    },
};

const EXPECTED_MIC = "0x87e8d91c3d07630fe2bf9b85c36d85cfe2d03ba5e63ac054c22ccb0110bebd31";

describe("AppController", () => {
    let appController: ETHEVMTransactionVerifierController;

    beforeEach(async () => {
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

    describe("root", () => {
        it("should 'verify' pass", async () => {
            const actualRes = await appController.verify({
                abiEncodedRequest: EXAMPLE_ENCODED_REQUEST,
            });
            expect(actualRes.status).toEqual("VALID");
            expect(JSON.parse(JSON.stringify(actualRes.response))).toStrictEqual(EXAMPLE_RESPONSE.response);
        });
        it("should prepare response", async () => {
            const actualRes = await appController.prepareResponse(EXAMPLE_REQUEST_NOMIC);
            expect(actualRes.status).toEqual("VALID");
            expect(JSON.parse(JSON.stringify(actualRes.response))).toStrictEqual(EXAMPLE_RESPONSE.response);
        });
        it("should obtain 'mic'", async () => {
            const actualMic = await appController.mic(EXAMPLE_REQUEST_NOMIC);
            expect(actualMic.messageIntegrityCode).toStrictEqual(EXPECTED_MIC);
        });
        it("should prepare request", async () => {
            const actualRequest = await appController.prepareRequest(EXAMPLE_REQUEST_NOMIC);
            expect(actualRequest.abiEncodedRequest).toStrictEqual(EXAMPLE_ENCODED_REQUEST);
        });
    });
});
