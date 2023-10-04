import { AbstractMesh, Engine, SceneLoader, TransformNode } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Color3, Color4, Matrix, Quaternion, Vector2, Vector3 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import "@babylonjs/loaders";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";


const cameraTargets: TransformNode[] = []; // 카메라 이동 위치값 배열
let cameraParent: TransformNode;
let beforeTransform: TransformNode;
const mousePosition = new Vector2(0, 0); // 화면 마우스 위치
const mouseMovement = new Vector2(0, 0); // 화면 마우스 움직임
let dragPosition = new Vector2(0, 0); // 화면 드래그로 인한 위치 보정값
const maxDragX: number = 5;
const maxDragY: number = 3;
const dragSpeed: number = 3;
let isMouseDown: boolean = false;
let lerpCount: number = 100;
let currentTarget: number = 0;

// 씬 내용
const createScene = (canvas: never) =>
{
  const engine = new Engine(canvas); // 엔진 제작
  const scene = new Scene(engine); // 씬 제작


  cameraParent = new TransformNode("cameraParent");
  beforeTransform = new TransformNode("beforeTransform");

  const canvasElement: Element = document.querySelector(".bjsCanvas")!; // 현재 캔버스 CSS 요소
  if (canvasElement == null) { console.error("canvasElement의 값이 null입니다."); } // 에러 처리

  const mainCamera = new FreeCamera("mainCamera", new Vector3(0, 5, -10), scene); // 메인 카메라 생성
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI"); // 전체 UI 관리 ADT
  InitHome();
  InitCamera(mainCamera, canvas);
  scene.clearColor = new Color4(0.8, 0.85, 0.95, 1);
  InitObject(scene, advancedTexture);

  InputEvent(canvasElement, mainCamera);
  MoveTarget(0);

  // 렌더링 루프
  engine.runRenderLoop(() =>
  {
    window.onresize = function() { engine.resize(); }

    MoveCamera(mainCamera);

    scene.render();
  });
};

// 홈 위치 초기 설정
function InitHome()
{
  const temp: TransformNode = new TransformNode("homeNode");
  temp.position = new Vector3(0, 5, -10);
  temp.rotationQuaternion = new Quaternion();
  temp.lookAt(Vector3.Zero());
  cameraTargets.push(temp);
}
// 카메라 초기 설정
function InitCamera(camera: FreeCamera, canvas: never)
{
  camera.inputs.clear(); // 카메라에 대한 인풋 모두 제거
  camera.attachControl(canvas, true);
  cameraParent.position = new Vector3();
  cameraParent.rotationQuaternion = new Quaternion();
  camera.parent = cameraParent;
  camera.position = Vector3.Zero();
  camera.rotationQuaternion = Quaternion.Zero();
}
// 오브젝트 초기 설정
function InitObject(scene: Scene, advancedTexture: AdvancedDynamicTexture)
{
  let temp: TransformNode;

  // 빛 제작
  new HemisphericLight("light", Vector3.Up(), scene);

  // 바닥 제작
  const ground = MeshBuilder.CreateCylinder("ground", { diameter: 20, height: 0.025 }, scene);
  const material_ground = new StandardMaterial("ground-material", scene);
  material_ground.diffuseColor = Color3.Green();
  ground.material = material_ground;
  ground.position = Vector3.Zero();

  // 구체 제작
  const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
  const material_sphere = new StandardMaterial("sphere-material", scene);
  material_sphere.diffuseColor = Color3.Red();
  sphere.material = material_sphere;
  sphere.position = new Vector3(1, 2, 3);
  // 구체 노드
  temp = new TransformNode("sphereNode");
  temp.parent = sphere;
  temp.position = new Vector3(2, 2, -5);
  temp.rotationQuaternion = new Quaternion();
  temp.lookAt(new Vector3(-2, 0, 0));
  cameraTargets.push(temp);
  // 구체 버튼
  const sphereButton = Button.CreateImageOnlyButton("sphere-button", "./images/yellowCircle64.png");
  sphereButton.width = "32px";
  sphereButton.height = "32px";
  sphereButton.color = "white";
  sphereButton.thickness = 0;
  advancedTexture.addControl(sphereButton);
  sphereButton.linkWithMesh(sphere);   
  sphereButton.linkOffsetX = "96px";
  // 구체 클릭 시 상호작용
  sphereButton.onPointerUpObservable.add(() => { alert("빨간 구체"); });

  // 실린더 제작
  const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameter: 1, height: 2 }, scene);
  const material_cylinder = new StandardMaterial("cylinder-material", scene);
  material_cylinder.diffuseColor = Color3.Blue();
  cylinder.material = material_cylinder;
  cylinder.position = new Vector3(-4, 1, 1);
  // 실린더 노드
  temp = new TransformNode("cylinderNode");
  temp.parent = cylinder;
  temp.position = new Vector3(2, 2, -5);
  temp.rotationQuaternion = new Quaternion();
  temp.lookAt(new Vector3(-2, 0, 0));
  cameraTargets.push(temp);
  // 실린더 버튼
  const cylinderButton = Button.CreateImageOnlyButton("cylinder-button", "./images/grayCircle64.png");
  cylinderButton.width = "32px";
  cylinderButton.height = "32px";
  cylinderButton.color = "white";
  cylinderButton.thickness = 0;
  advancedTexture.addControl(cylinderButton);
  cylinderButton.linkWithMesh(cylinder);   
  cylinderButton.linkOffsetX = "96px";
  // 구체 클릭 시 상호작용
  cylinderButton.onPointerUpObservable.add(() => { alert("파란 원통"); });

  let human: AbstractMesh;
  // 사람 제작
  SceneLoader.ImportMesh("", "./models/", "DummyMale.glb", scene, (results) =>
  {
    human = results[0];
    human.name = "__humanRoot__";
    human.id = "__humanRoot__";
    human.position = new Vector3(5, 0, -3);
    human.lookAt(Vector3.Zero());
    // 사람 버튼
    const humanButton = Button.CreateImageOnlyButton("human-button", "./images/blueCircle64.png");
    humanButton.width = "32px";
    humanButton.height = "32px";
    humanButton.color = "white";
    humanButton.thickness = 0;
    advancedTexture.addControl(humanButton);
    humanButton.linkWithMesh(human);   
    humanButton.linkOffsetX = "96px";
    // 구체 클릭 시 상호작용
    humanButton.onPointerUpObservable.add(function() { alert("사람"); });
  });
  // 사람 노드
  temp = new TransformNode("humanNode");
  temp.parent = human!;
  temp.position = new Vector3(2, 2, -5);
  temp.rotationQuaternion = new Quaternion();
  temp.lookAt(new Vector3(-2, 0, 0));
  cameraTargets.push(temp);
}
// 인풋 이벤트
function InputEvent(canvasElement: Element, camera: FreeCamera)
{
  // 마우스 위치에 따른 이동
  window.addEventListener("pointermove", (event) =>
  {
    mousePosition.x = event.clientX / canvasElement.clientWidth - 0.5;
    mousePosition.y = -event.clientY / canvasElement.clientHeight - 0.5;
    mouseMovement.x = -event.movementX * dragSpeed / 1000;
    mouseMovement.y = event.movementY * dragSpeed / 1000;
  });

  canvasElement.addEventListener("pointerdown", () => { isMouseDown = true; });
  canvasElement.addEventListener("pointerup", () => { isMouseDown = false; });

  window.addEventListener("keydown", (event) =>
  {
    switch (event.code)
    {
      case "Numpad0":
        MoveTarget(0);
        break;
      
      case "Numpad1":
        MoveTarget(1);
        break;

      case "Numpad2":
        MoveTarget(2);
        break;

      case "Numpad3":
        MoveTarget(3);
        break;
    }
  })
}

// 카메라 이동
function MoveCamera(camera: FreeCamera)
{
  // 마우스 드래그 시 카메라 이동
  if (isMouseDown)
  {
    if (dragPosition.x + mouseMovement.x > maxDragX) { dragPosition.x = maxDragX; }
    else if (dragPosition.x + mouseMovement.x < -maxDragX) { dragPosition.x = -maxDragX; }
    else { dragPosition.x += mouseMovement.x; }
    if (dragPosition.y + mouseMovement.y > maxDragY) { dragPosition.y = maxDragY; }
    else if (dragPosition.y + mouseMovement.y < -maxDragY) { dragPosition.y = -maxDragY; }
    else { dragPosition.y += mouseMovement.y; }
  }

  if (lerpCount < 100)
  {
    lerpCount++;

    Vector3.SlerpToRef(
      beforeTransform.position,
      cameraTargets[currentTarget].absolutePosition,
      lerpCount * 0.01,
      cameraParent.position);
    
    Quaternion.SlerpToRef(
      beforeTransform.rotationQuaternion!,
      cameraTargets[currentTarget].absoluteRotationQuaternion,
      lerpCount * 0.01,
      cameraParent.rotationQuaternion!
    );
  }
  camera.position.x += (mousePosition.x + dragPosition.x - camera.position.x) * 0.1;
  camera.position.y += (mousePosition.y + dragPosition.y - camera.position.y) * 0.1;
}

function MoveTarget(changeTargetNumber: number)
{
  dragPosition = Vector2.Zero();
  currentTarget = changeTargetNumber;
  beforeTransform.position = cameraParent.position;
  beforeTransform.rotationQuaternion = cameraParent.rotationQuaternion;

  lerpCount = 0;
}

export { createScene };