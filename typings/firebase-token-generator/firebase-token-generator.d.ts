declare module "firebase-token-generator" {
    export class FirebaseTokenGenerator {
        constructor(secret: string);
        createToken(data: any): string;
    }
}
