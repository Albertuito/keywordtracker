declare module '@paypal/checkout-server-sdk' {
    export namespace core {
        class SandboxEnvironment {
            constructor(clientId: string, clientSecret: string);
        }
        class LiveEnvironment {
            constructor(clientId: string, clientSecret: string);
        }
        class PayPalHttpClient {
            constructor(environment: SandboxEnvironment | LiveEnvironment);
            execute<T>(request: any): Promise<{ result: T; statusCode: number }>;
        }
    }
    export namespace orders {
        class OrdersCaptureRequest {
            constructor(orderId: string);
            requestBody(body: any): void;
        }
    }
}
