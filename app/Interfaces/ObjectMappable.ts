import ObjectMap from '../Models/ObjectMap';
export interface ObjectMappable {
	objectMap: ObjectMap;
	setTarget(targetPath: string): void;
	unsetTarget(targetPath: string): void;
	updateTargetsWithProperties(props: any): void;
	syncData(): Object;
}
