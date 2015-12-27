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
	var sharp: any;
	export default sharp;
}
