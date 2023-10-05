import { Scene, TransformNode } from "@babylonjs/core";

export class ParentPositioningTransformNode extends TransformNode {
    constructor (name: string, scene: Scene, parent: TransformNode) {
        super(name, scene);
        super.setParent(parent);
        this.position = parent.position;
    }
}