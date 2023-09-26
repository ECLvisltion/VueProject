import { Engine, SceneLoader, TransformNode } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Color3, Color4, Vector2, Vector3 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import "@babylonjs/loaders";
import { AdvancedDynamicTexture, Rectangle } from "@babylonjs/gui";


const maxDragX: number = 5;
const maxDragY: number = 3;
const dragSpeed: number = 3;
let isMouseDown: boolean = false;

// 씬 내용
const createScene = (canvas: never) => {
  const engine = new Engine(canvas); // 엔진 제작
  const scene = new Scene(engine); // 씬 제작
  const cameraPosition: TransformNode[] = []; // 카메라 이동 위치값 배열
  const mousePosition = new Vector2(0, 0); // 화면 마우스 위치
  const mouseMovement = new Vector2(0, 0); // 화면 마우스 움직임
  const dragPosition = new Vector2(0, 0); // 화면 드래그로 인한 위치 보정값
  const mainCamera = new FreeCamera("mainCamera", new Vector3(0, 5, -10), scene); // 메인 카메라 생성
  const canvasElement: Element = document.querySelector(".bjsCanvas")!;
  if (canvasElement == null) { console.error("canvasElement의 값이 null입니다."); }
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
  //let currentCamera: number = 0;

  const temp: any = new TransformNode("homePosition");
  temp.position = new Vector3(0, 5, -10);
  temp.lookAt(Vector3.Zero());
  cameraPosition.push(temp);
  InitCamera(mainCamera, canvas, cameraPosition[0]);

  new HemisphericLight("light", Vector3.Up(), scene);

  scene.clearColor = new Color4(0.8, 0.85, 0.95, 1);
  InitObject(scene, advancedTexture);

  InputEvent(mousePosition, canvasElement, mouseMovement);

  // 렌더링 루프
  engine.runRenderLoop(() => {
    window.onresize = function() { engine.resize(); }

    MoveCamera(mainCamera, dragPosition, mouseMovement, mousePosition);

    scene.render();
  });
};

// 카메라 초기 설정
function InitCamera(camera: FreeCamera, canvas: never, home: TransformNode) {
  camera.inputs.clear(); // 카메라에 대한 인풋 모두 제거
  camera.setTarget(Vector3.Zero()); // 바라볼 대상
  camera.attachControl(canvas, true);
  camera.parent = home;
  camera.position = Vector3.Zero();
  camera.rotation = Vector3.Zero();
}

// 오브젝트 초기 설정
function InitObject(scene: Scene, advancedTexture: AdvancedDynamicTexture) {
  const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
  const material_ground = new StandardMaterial("ground-material", scene);
  material_ground.diffuseColor = Color3.Green();
  ground.material = material_ground;

  const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
  const material_sphere = new StandardMaterial("sphere-material", scene);
  material_sphere.diffuseColor = Color3.Red();
  sphere.material = material_sphere;
  sphere.position = new Vector3(1, 2, 3);

  const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameter: 1, height: 2 }, scene);
  const material_cylinder = new StandardMaterial("cylinder-material", scene);
  material_cylinder.diffuseColor = Color3.Blue();
  cylinder.material = material_cylinder;
  cylinder.position = new Vector3(-4, 1, 1);

  SceneLoader.ImportMeshAsync(null, "./models/", "DummyMale.glb", scene).then((results) => {
    const root = results.meshes[0];
    root.name = "__humanRoot__";
    root.id = "__humanRoot__";
    root.position = new Vector3(5, 0, -3);
    root.lookAt(sphere.position);

    const rect3 = new Rectangle();
    rect3.width = "40px";
    rect3.height = "40px";
    rect3.cornerRadius = 20;
    rect3.color = "yellow";
    rect3.thickness = 4;
    rect3.background = "green";
    advancedTexture.addControl(rect3);
    rect3.linkWithMesh(root);   
    rect3.linkOffsetY = -50;
  });

  const rect1 = new Rectangle();
  rect1.width = "40px";
  rect1.height = "40px";
  rect1.cornerRadius = 20;
  rect1.color = "Orange";
  rect1.thickness = 4;
  rect1.background = "green";
  advancedTexture.addControl(rect1);
  rect1.linkWithMesh(sphere);   
  rect1.linkOffsetY = -50;

  const rect2 = new Rectangle();
  rect2.width = "40px";
  rect2.height = "40px";
  rect2.cornerRadius = 20;
  rect2.color = "red";
  rect2.thickness = 4;
  rect2.background = "green";
  advancedTexture.addControl(rect2);
  rect2.linkWithMesh(cylinder);   
  rect2.linkOffsetY = -50;
}

// 인풋 이벤트
function InputEvent(mousePosition: Vector2, canvasElement: Element, mouseMovement: Vector2) {
  window.addEventListener("pointermove", function(event) { // 마우스 위치에 따른 이동
    mousePosition.x = event.clientX / 1000 - 0.5;
    mousePosition.y = -event.clientY / 1000 - 0.5;
    mouseMovement.x = -event.movementX * dragSpeed / 1000;
    mouseMovement.y = event.movementY * dragSpeed / 1000;
  });

  canvasElement.addEventListener("pointerdown", function(event) { isMouseDown = true; });
  canvasElement.addEventListener("pointerup", function(event) { isMouseDown = false; });
}

// 카메라 이동
function MoveCamera(camera: FreeCamera, dragPosition: Vector2, mouseMovement: Vector2, mousePosition: Vector2) {
  if (isMouseDown) {
    if (dragPosition.x + mouseMovement.x > maxDragX) { dragPosition.x = maxDragX; }
    else if (dragPosition.x + mouseMovement.x < -maxDragX) { dragPosition.x = -maxDragX; }
    else { dragPosition.x += mouseMovement.x; }
    if (dragPosition.y + mouseMovement.y > maxDragY) { dragPosition.y = maxDragY; }
    else if (dragPosition.y + mouseMovement.y < -maxDragY) { dragPosition.y = -maxDragY; }
    else { dragPosition.y += mouseMovement.y; }
  }

  camera.position.x += (mousePosition.x + dragPosition.x - camera.position.x) * 0.1;
  camera.position.y += (mousePosition.y + dragPosition.y - camera.position.y) * 0.1;
}


export { createScene };