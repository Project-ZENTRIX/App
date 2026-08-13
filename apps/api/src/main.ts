import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter.js";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor.js";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor.js";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ["http://127.20.0.1:3000"],
        credentials: true,
    });
    app.setGlobalPrefix("api", {
        exclude: [
            { path: "docs", method: RequestMethod.ALL },
            { path: "docs/(.*)", method: RequestMethod.ALL },
            { path: "openapi.json", method: RequestMethod.ALL },
        ],
    });
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            forbidNonWhitelisted: true,
        })
    );
    app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    if (process.env.NODE_ENV !== "production") {
        const config = new DocumentBuilder()
            .setTitle("Project ZENTRIX · API Preview")
            .setDescription("Project ZENTRIX backend API documentation")
            .setVersion("0.0.1")
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup("openapi", app, document, {
            jsonDocumentUrl: "openapi.json",
            yamlDocumentUrl: "openapi.yaml",
            useGlobalPrefix: false,
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
        app.use(
            "/docs",
            apiReference({
                url: "/openapi.json",
                theme: "saturn",
            })
        );
    }

    await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? "0.0.0.0");
}
bootstrap();
