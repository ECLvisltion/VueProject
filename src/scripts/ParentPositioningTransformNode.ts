import { Scene, TransformNode } from "@babylonjs/core";

export class TransformNode_pos extends TransformNode {
    constructor (name: string, scene: Scene, parent: TransformNode) {
        super(name, scene);
        super.setParent(parent);
        this.position = parent.position;
    }
}