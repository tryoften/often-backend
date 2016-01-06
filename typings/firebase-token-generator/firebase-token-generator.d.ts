declare module "firebase-token-generator" {
	class FirebaseTokenGenerator {
        constructor(secret: string);
        createToken(data: any): string;
    }

	export = FirebaseTokenGenerator
}
