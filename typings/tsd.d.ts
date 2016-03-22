/// <reference path="backbone/backbone-global.d.ts" />
/// <reference path="backbone/backbone.d.ts" />
/// <reference path="jquery/jquery.d.ts" />
/// <reference path="underscore/underscore.d.ts" />
/// <reference path="backbonefire/backbonefire.d.ts" />
/// <reference path="node/node.d.ts" />
/// <reference path="es6-shim/es6-shim.d.ts" />
/// <reference path="express/express.d.ts" />
/// <reference path="mime/mime.d.ts" />
/// <reference path="serve-static/serve-static.d.ts" />
/// <reference path="minimist/minimist.d.ts" />
/// <reference path="cheerio/cheerio.d.ts" />
/// <reference path="lodash/lodash.d.ts" />
/// <reference path="react/react.d.ts" />

declare module "firebase-queue" {

	class Queue {
		constructor(ref: Firebase, options: any, process: () => void);
	}

	export = Queue
}

declare module "feedparser" {
	export default class Feedparser {
		on(eventName: string, handler: (error: any) => void);
	}
}

declare module "sharp" {
	function sharp(data: any): any;
	export default sharp;
}

declare module "elasticsearch" {
	export class Client {
		constructor(opts: any);
		bulk(options: any, callback: (results: any, error: Error) => void): void;
		msearch(options: any, callback: (results: any, error: Error) => void): void;
		update(options: any, callback: (results: any, error: Error) => void): void;
		suggest(options: any, callback: (results: any, error: Error) => void): void;
		search(options: any, callback: (results: any, error: Error) => void): void;
	}
}

declare module "winston" {
	export var transports: any;
	export class Logger {
		rewriters: any[];

		constructor(opts: any);
		info(...args): void;
		warn(...args): void;
		error(...args): void;
		log(level: string, ...args): this;
		profile(info: string);

		// Adds a transport of the specified type to this instance.
		add(transport: any, options: any): this;
	}
}

declare module "winston-gcl" {
	export var GCL: any;
}

declare module "winston-firebase" {
	export var Firebase: any;
}

declare module "googleapis" {
	export var auth: any;
}

declare module "gcloud" {
	export var storage: any;
}

declare module "sha1" {
	export default function sha1(str: string): string;
}

declare module "request" {
	var request: any;
	export default request;
}

declare module "shortid" {
	export function generate(): string;
}

declare module "object-path" {
	export function get(object: any, path: string);
	export function get(object: any, path: string[]);
}
