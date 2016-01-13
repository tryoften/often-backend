// Type definitions for Restler 3.4.0
// Project: https://github.com/danwrong/restler
// Definitions by: Luc Succes <https://github.com/l2succes>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module "restler" {
	interface RequestOptions {
		/// Request method, can be get, post, put, delete. Defaults to "get"
		method?: string;

		/// Query string variables as a javascript object, will override the querystring in the URL. Defaults to empty.
		query?: any;

		/// The data to be added to the body of the request. Can be a string or any object.
		/// Note that if you want your request body to be JSON with the Content-Type: application/json,
		/// you need to JSON.stringify your object first. Otherwise, it will be sent as application/x-www-form-urlencoded and encoded accordingly.
		/// Also you can use json() and postJson() methods.
		data?: any;

		/// A function that will be called on the returned data. Use any of predefined restler.parsers.
		/// See parsers section below. Defaults to restler.parsers.auto.
		parser?: (data: any) => any;

		/// Options for xml2js
		xml2js?: any;

		/// The encoding of the request body. Defaults to "utf8"
		encoding?: string;

		/// The encoding of the response body. For a list of supported values see Buffers. Additionally accepts
		/// "buffer" - returns response as Buffer. Defaults to "utf8".
		decoding?: string;

		/// A hash of HTTP headers to be sent. Defaults to { 'Accept': '*/*', 'User-Agent': 'Restler for node.js' }
		headers?: any;

		/// Basic auth username. Defaults to empty.
		username?: string;

		/// Basic auth password. Defaults to empty.
		password?: string;

		/// OAuth Bearer Token. Defaults to empty.
		accessToken?: string;

		/// If set the data passed will be formatted as multipart/form-encoded. See multipart example below. Defaults to `false`.
		multipart?: boolean;

		/// A http.Client instance if you want to reuse or implement some kind of connection pooling. Defaults to empty.
		client?: any;

		/// If set will recursively follow redirects. Defaults to `true`.
		followRedirects?: boolean;

		/// If set, will emit the timeout event when the response does not return within the said value (in ms)
		timeout?: number;

		/// If true, the server certificate is verified against the list of supplied CAs. An 'error' event is emitted if verification fails.
		/// Verification happens at the connection level, before the HTTP request is sent. Default true.
		rejectUnauthorized?: boolean;

		/// HTTP Agent instance to use. If not defined globalAgent will be used. If false opts out of connection pooling with an Agent,
		/// defaults request to Connection: close.
		agent?: any;
	}

	// Basic method to make a request of any type. The function returns a RestRequest object that emits events.
	export function request(url: string, options?: RequestOptions): Request;

	// Create a GET request.
	export function get(url: string, options?: RequestOptions): Request;

	// Create a POST request.
	export function post(url: string, options?: RequestOptions): Request;

	// Create a PUT request.
	export function put(url: string, options?: RequestOptions): Request;

	// Create a DELETE request.
	export function del(url: string, options?: RequestOptions): Request;

	// Create a HEAD request.
	export function head(url: string, options?: RequestOptions): Request;

	// Create a PATCH request.
	export function patch(url: string, options?: RequestOptions): Request;

	// Send json data via GET method.
	export function json(url: string, data?: any, options?: RequestOptions): Request;

	// Send json data via POST method.
	export function postJson(url: string, data?: any, options?: RequestOptions): Request;

	// Send json data via PUT method.
	export function putJson(url: string, data?: any, options?: RequestOptions): Request;

	// Send json data via PATCH method.
	export function patchJson(url: string, data?: any, options?: RequestOptions): Request;


	import {EventEmitter} from "events";
	export class Request extends EventEmitter {
		url: string;
		options: any;
		headers: any;

		constructor(url: string, options: RequestOptions);
	}

	interface ServiceOptions {
		baseURL: string;
		parser?: any;
	}

	export class Service {
		constructor(options: ServiceOptions);
		request(path: string, options?: RequestOptions): Request;
		get(url: string, options?: RequestOptions): Request;
		patch(url: string, options?: RequestOptions): Request;
		put(url: string, options?: RequestOptions): Request;
	}

	export var parsers: any;
}
