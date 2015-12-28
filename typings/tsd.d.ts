/// <reference path="backbone/backbone-global.d.ts" />
/// <reference path="backbone/backbone.d.ts" />
/// <reference path="jquery/jquery.d.ts" />
/// <reference path="underscore/underscore.d.ts" />
/// <reference path="backbonefire/backbonefire.d.ts" />
/// <reference path="node/node.d.ts" />

declare module "firebase-queue" {
	export default class Queue {
		constructor(ref: Firebase, options: any, process: () => void);
	}
}

declare module "feedparser" {

}

declare module "sharp" {
	function sharp(data: any): any;
	export default sharp;
}

declare module "elasticsearch" {
	export class Client {
		bulk(options: any, callback: (results: any, error: Error) => void): void;
	}
}

declare module "winston" {
	export var transports: any;
	export class Logger {
		constructor(opts: any);
	}
}
declare module "winston-gcl" {
	export var GCL: any;
}
declare module "winston-firebase" {
	export var Firebase: any;
}

declare module "googleapis" {

}
