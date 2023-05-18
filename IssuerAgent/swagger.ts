import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Agent backend",
            version: "1.0.0",
            description: "An agent"
        },
        basePath: '/'
    },
    apis: ["./dist/routes/*.js"]
}
export const swaggerSpec = swaggerJSDoc(swaggerOptions);