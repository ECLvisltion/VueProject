import { Engine, SceneLoader } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Color3, Color4, Vector3 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import "@babylonjs/loaders";


// 씬 내용
const createScene = (canvas: never) => {
  const engine = new Engine(canvas);
  const scene = new Scene(engine);
  const homeStartPosition = new Vector3(0, 5, -10);
  const cameraGoalPosition = new Vector3(0, 0, 0);

  const mainCamera = new FreeCamera("mainCamera", new Vector3(0, 5, -10), scene);
  mainCamera.inputs.clear();
  mainCamera.setTarget(Vector3.Zero());
  mainCamera.attachControl(canvas, true);

  new HemisphericLight("light", Vector3.Up(), scene);

  scene.clearColor = new Color4(0.8, 0.85, 0.95, 1);
  const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
  const material_ground = new StandardMaterial("ground-material", scene);
  material_ground.diffuseColor = Color3.Green();
  ground.material = material_ground;
  const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
  sphere.position = new Vector3(0, 1, 0);
  const material_sphere = new StandardMaterial("sphere-material", scene);
  material_sphere.diffuseColor = Color3.Red();
  sphere.material = material_sphere;
  SceneLoader.ImportMeshAsync(null, "./models/", "DummyMale.glb", scene).then((results) => {
    const root = results.meshes[0];
    root.name = "__humanRoot__";
    root.id = "__humanRoot__";
    root.position = new Vector3(3, 0, 0);
  })

  // 렌더링 루프
  engine.runRenderLoop(() => {
    window.onresize = function() { engine.resize(); }
    window.addEventListener("mousemove", function(event) {
      cameraGoalPosition.x = homeStartPosition.x + (event.clientX / engine.getRenderWidth(true)) - 0.5;
      cameraGoalPosition.y = homeStartPosition.y + (event.clientY / engine.getRenderHeight(true)) - 0.5;
    });

    mainCamera.position.x += (cameraGoalPosition.x - mainCamera.position.x) * 0.1;
    mainCamera.position.y += (cameraGoalPosition.y - mainCamera.position.y) * 0.1;
    //mainCamera.position.z += (cameraGoalPosition.z - mainCamera.position.z) * 0.1;

    scene.render();
  });
};

export { createScene };