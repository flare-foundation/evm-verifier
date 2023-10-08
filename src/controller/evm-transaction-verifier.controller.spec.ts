import { Test, TestingModule } from "@nestjs/testing";
import { EVMTransactionVerifierService } from "../service/evm-transaction-verifier.service";
import { EVMTransactionVerifierController } from "./evm-transaction-verifier.controller";
import { readFileSync } from "fs";
import { ExampleData } from "../external-libs/ts/interfaces";
import { EVMTransaction_RequestNoMic, EVMTransaction_Request, EVMTransaction_Response } from "../dto/EVMTransaction.dto";

describe("AppController", () => {
    let appController: EVMTransactionVerifierController;
    let exampleData: ExampleData<EVMTransaction_RequestNoMic, EVMTransaction_Request, EVMTransaction_Response>;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [EVMTransactionVerifierController],
            providers: [EVMTransactionVerifierService],
        }).compile();

        appController = app.get<EVMTransactionVerifierController>(EVMTransactionVerifierController);
        exampleData = JSON.parse(readFileSync("src/example-data/EVMTransaction.json", "utf8"));
    });

    describe("root", () => {
        it("should 'verify' pass", async () => {
            const actualRes = await appController.verify({
                abiEncodedRequest: exampleData.encodedRequestZeroMic,
            });
            expect(actualRes.status).toEqual("VALID");
            expect(actualRes.response).toStrictEqual(exampleData.response);
        });
        it("should prepare response", async () => {
            const actualRes = await appController.prepareResponse(exampleData.requestNoMic);
            expect(actualRes.status).toEqual("VALID");
            expect(actualRes.response).toStrictEqual(exampleData.response);
        });
        it("should obtain 'mic'", async () => {
            const actualMic = await appController.mic({
                ...exampleData.requestNoMic,
            });
            expect(actualMic).toStrictEqual(exampleData.messageIntegrityCode);
        });
        it("should prepare request", async () => {
            const actualRequest = await appController.prepareRequest(exampleData.requestNoMic);
            expect(actualRequest.abiEncodedRequest).toStrictEqual(exampleData.encodedRequest);
        });
    });
});
