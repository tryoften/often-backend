import { BaseModelType } from '@often/often-core';
const neo4j = require('neo4j-driver').v1;

export interface PackNodeAttributes extends NodeAttributes {
	ownerId: string;
}

export interface UserNodeAttributes extends NodeAttributes {

}

interface NodeAttributes {
	id: string;
	type: BaseModelType;
}

export interface RelationshipAttributes {
	name: string;
	time_updated: string;
}

class GraphModel {

	private static _instance: GraphModel;
	driver: any;
	session: any;

	constructor() {
		if (!GraphModel._instance) {
			GraphModel._instance = this;
			this.driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neo4j123"));
			this.session = this.driver.session();
		}
		return GraphModel._instance;
	}

	executeCommands(commands: string[], params: NodeAttributes) {
		let jointCommand = "";
		for (let comm of commands) {
			jointCommand = jointCommand.concat(comm + '\n');
		}
		return this.session.run(jointCommand, {params});
	}
	updateNode(param: NodeAttributes) {
		let header = this.createQueryHeader(param);
		let command = `MERGE (:${param.type} ${header})`;
		return this.session.run(command, {param});
	}

	updateRelationship(source: NodeAttributes, target: NodeAttributes, relationAttrs: RelationshipAttributes) {
		let command = `MATCH (source:${source.type} { id: "${source.id}" }), (target:${target.type} { id: "${target.id}" })
		MERGE (source) -[:${relationAttrs.name}]-> (target)`;
		console.log(command);
		return this.session.run(command);
	}

	removeRelationship(source: NodeAttributes, target: NodeAttributes, relationAttrs: RelationshipAttributes) {
		let command = `MATCH (source:${source.type} { id: "${source.id}" }) -[r:${relationAttrs.name}]-> (target:${target.type} { id: "${target.id}" })
		DELETE r`;
		console.log(command);
		return this.session.run(command);
	}

	getFollowCountPacksByOwnerId(sourceUser: UserNodeAttributes, pack: PackNodeAttributes, relationAttrs: RelationshipAttributes) {
		let command = `MATCH (source:user { id: "${sourceUser.id}" }) -[${relationAttrs.name}]-> (target:pack {ownerId: "${pack.ownerId}" })
		WITH count(target) as packCount
		RETURN packCount`;
		return this.session.run(command);
	}


	createQueryHeader(param: NodeAttributes) {
		let keys = Object.keys(param);
		let query = "";
		for (let i = 0; i < keys.length; i++) {
			let k = keys[i];
			query = query.concat(`${k}: {param}.${k} ${(i + 1 === keys.length) ? "" : ","}`);
		}
		return `{${query}}`;
	}

}

export default GraphModel;
