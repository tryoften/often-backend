declare module "firebase-token-generator" {
    export default class FirebaseTokenGenerator {
        constructor(secret: string);
        createToken(data: any): string;
    }
}
