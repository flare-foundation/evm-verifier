import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    const basePath = process.env.APP_BASE_PATH ?? "";

    app.setGlobalPrefix(basePath);

    const config = new DocumentBuilder()
        .setTitle("EVM transaction verifier server")
        .setDescription("The verifier server to prepare and verify EVM transactions")
        .setBasePath(basePath)
        .addApiKey({ type: "apiKey", name: "X-API-KEY", in: "header" }, "X-API-KEY")
        .setVersion("1.0")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${basePath}/api-doc`, app, document);

    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    console.log(`Your template is available on PORT: ${PORT}`);
    await app.listen(PORT);
}
void bootstrap();
