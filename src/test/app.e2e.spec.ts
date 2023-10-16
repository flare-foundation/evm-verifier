import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import axios from "axios";
import helmet from "helmet";
import { AppModule } from "../app.module";

describe("AppController (e2e)", () => {
    let app: INestApplication;

    beforeEach(async () => {
        app = await NestFactory.create<NestExpressApplication>(AppModule);

        app.use(helmet());
        app.useGlobalPipes(new ValidationPipe({ transform: true }));

        app.setGlobalPrefix(process.env.APP_BASE_PATH ?? "");

        const config = new DocumentBuilder()
            .setTitle("Verifier server template")
            .setDescription("The template to verifier server")
            .addApiKey({ type: "apiKey", name: "X-API-KEY", in: "header" }, "X-API-KEY")
            .setVersion("1.0")
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup("api", app, document);

        const PORT = 3311;
        console.log(`Your template is available on PORT: ${PORT}`);
        await app.listen(PORT);
    });

    afterEach(async () => {
        await app.close();
    });

    it("EVMTransaction/prepareResponse", async () => {
        try {
            const { data, status } = await axios.post<Response>(
                "http://127.0.0.1:3311/EVMTransaction/prepareResponse",
                {
                    attestationType: "0x45564d5472616e73616374696f6e000000000000000000000000000000000000",
                    sourceId: "0x4554480000000000000000000000000000000000000000000000000000000000",
                    requestBody: {
                        transactionHash: "0xb11e60decfd2ae39d2ec927fb783aa009c052044c795bf9346f46741f488512c",
                        requiredConfirmations: "3",
                        provideInput: false,
                        listEvents: true,
                        logIndices: [],
                    },
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-API-KEY": "12345",
                    },
                },
            );

            //console.log(status);
            //console.log(JSON.stringify(data, null, 4));

            expect(status).toBe(200);

            expect(data).toHaveProperty("status");
            expect(data.status).toBe("VALID");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log("error message: ", error.message);
                // 👇️ error: AxiosError<any, any>
                return error.message;
            } else {
                console.log("unexpected error: ", error);
                return "An unexpected error occurred";
            }
        }
    });
});
