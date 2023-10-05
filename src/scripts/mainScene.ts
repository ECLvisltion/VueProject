import { AbstractMesh, Engine, SceneLoader, TransformNode } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Color3, Color4, Quaternion, Vector2, Vector3 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import "@babylonjs/loaders";
import { AdvancedDynamicTexture, Button, Control, Image } from "@babylonjs/gui";
import { ParentPositioningTransformNode } from "./ParentPositioningTransformNode";


const cameraTargets: TransformNode[] = []; // 카메라 이동 위치값 배열
let cameraParent: TransformNode; // 카메라 이동용 부모
let beforeTransform: TransformNode; // 카메라 이동 시작 위치
const targetButtons: Button[] = []; // 해당 타겟의 버튼
let descriptionImage: Image;
let frameImage: Image;
const mousePosition = new Vector2(0, 0); // 화면 마우스 위치
const mouseMovement = new Vector2(0, 0); // 화면 마우스 움직임
let dragPosition = new Vector2(0, 0); // 화면 드래그로 인한 위치 보정값
const maxDragX: number = 5; // X방향 드래그로 이동 가능한 최대 길이
const maxDragY: number = 3; // Y방향 드래그로 이동 가능한 최대 길이
const dragSpeed: number = 3; // 드래그 스피드
let isMouseDown: boolean = false; // 마우스 드래그 여부
let lerpCount: number = 100; // 카메라 Lerp 카운팅
let currentTarget: number = 0; // 현재 타겟

// 씬 내용
const createScene = (canvas: HTMLCanvasElement) =>
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

  InputEvent(canvasElement);

  // 렌더링 루프
  engine.runRenderLoop(() =>
  {
    window.onresize = function() { engine.resize(); }

    MoveCamera(mainCamera);
    UI(canvasElement);

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
function InitCamera(camera: FreeCamera, canvas: HTMLCanvasElement)
{
  camera.inputs.clear(); // 카메라에 대한 인풋 모두 제거
  camera.attachControl(canvas, true);
  cameraParent.position = new Vector3();
  cameraParent.rotationQuaternion = new Quaternion();
  camera.parent = cameraParent;
  camera.position = Vector3.Zero();
  camera.rotationQuaternion = Quaternion.Zero();

  currentTarget = 0;
  cameraParent.position = cameraTargets[0].absolutePosition.clone();
  cameraParent.rotationQuaternion = cameraTargets[0].absoluteRotationQuaternion.clone();
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
  temp.lookAt(new Vector3(2, 0, 0));
  cameraTargets.push(temp);
  // 구체 버튼
  const sphereButton = Button.CreateImageOnlyButton("sphere-button", "./images/yellowCircle64.png");
  targetButtons.push(sphereButton);
  sphereButton.width = "32px";
  sphereButton.height = "32px";
  sphereButton.color = "white";
  sphereButton.thickness = 0;
  advancedTexture.addControl(sphereButton);
  sphereButton.linkWithMesh(sphere);   
  sphereButton.linkOffsetX = "96px";
  sphereButton.zIndex = 10;
  // 구체 클릭 시 상호작용
  sphereButton.onPointerUpObservable.add(() =>
  {
    MoveTarget(1);
  });

  // 실린더 제작
  const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameter: 1, height: 2 }, scene);
  const material_cylinder = new StandardMaterial("cylinder-material", scene);
  material_cylinder.diffuseColor = Color3.Blue();
  cylinder.material = material_cylinder;
  cylinder.position = new Vector3(-4, 1, 1);
  cylinder.addRotation(0, Math.PI * 1.5, 0);
  // 실린더 노드
  temp = new TransformNode("cylinderNode");
  temp.parent = cylinder;
  temp.position = new Vector3(2, 2, -5);
  temp.rotationQuaternion = new Quaternion();
  temp.lookAt(new Vector3(2, 0, 0));
  cameraTargets.push(temp);
  // 실린더 버튼
  const cylinderButton = Button.CreateImageOnlyButton("cylinder-button", "./images/grayCircle64.png");
  targetButtons.push(cylinderButton);
  cylinderButton.width = "32px";
  cylinderButton.height = "32px";
  cylinderButton.color = "white";
  cylinderButton.thickness = 0;
  advancedTexture.addControl(cylinderButton);
  cylinderButton.linkWithMesh(cylinder);   
  cylinderButton.linkOffsetX = "96px";
  cylinderButton.zIndex = 10;
  // 구체 클릭 시 상호작용
  cylinderButton.onPointerUpObservable.add(() =>
  {
    MoveTarget(2);
  });

  // 사람 제작
  let human: AbstractMesh;
  SceneLoader.ImportMesh("", "./models/", "DummyMale.glb", scene, (results) =>
  {
    human = results[0];
    human.name = "__humanRoot__";
    human.id = "__humanRoot__";
    human.position = new Vector3(5, 0, -3);
    human.lookAt(Vector3.Zero(), Math.PI, 0, 0);
    // 사람 노드
    temp = new TransformNode("humanNode");
    temp.parent = human!;
    temp.position = new Vector3(2, 2, 5);
    temp.rotationQuaternion = new Quaternion();
    temp.lookAt(new Vector3(2, 1, 0), 0, 0, Math.PI);
    cameraTargets.push(temp);
    // 사람 버튼
    const humanButton = Button.CreateImageOnlyButton("human-button", "./images/blueCircle64.png");
    targetButtons.push(humanButton);
    humanButton.width = "32px";
    humanButton.height = "32px";
    humanButton.color = "white";
    humanButton.thickness = 0;
    advancedTexture.addControl(humanButton);
    humanButton.linkWithMesh(human);   
    humanButton.linkOffsetX = "96px";
    humanButton.linkOffsetY = "-48px";
    humanButton.zIndex = 10;
    // 구체 클릭 시 상호작용
    humanButton.onPointerUpObservable.add(() =>
    {
      MoveTarget(3);
    });
  });
  
  // 설명 UI
  descriptionImage = new Image("descriptionImage", "./images/whitebox256.png");
  descriptionImage.stretch = Image.STRETCH_NINE_PATCH;
  descriptionImage.sliceLeft = 24;
  descriptionImage.sliceTop = 24;
  descriptionImage.sliceRight = 232;
  descriptionImage.sliceBottom = 232;
  descriptionImage.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  descriptionImage.width = "30%";
  descriptionImage.height = "80%";
  descriptionImage.left = "-10%"
  descriptionImage.zIndex = 9;
  descriptionImage.transformCenterX = 1;
  descriptionImage.alpha = 0;
  advancedTexture.addControl(descriptionImage);

  // 프레임 UI
  frameImage = new Image("frameImage", "./images/whiteframe1024.png");
  frameImage.stretch = Image.STRETCH_NINE_PATCH;
  frameImage.sliceLeft = 128;
  frameImage.sliceTop = 128;
  frameImage.sliceRight = 896;
  frameImage.sliceBottom = 896;
  frameImage.width = "100%";
  frameImage.height = "100%";
  frameImage.zIndex = 0;
  advancedTexture.addControl(frameImage);
}
// 인풋 이벤트
function InputEvent(canvasElement: Element)
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
      case "Escape":
        MoveTarget(0);
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
    
    if ((Math.abs(dragPosition.x) > 0.1 || Math.abs(dragPosition.y) > 0.1) && currentTarget != 0)
    {
      MoveTarget(0); console.log(dragPosition)
    }
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
// 카메라 타겟 이동
function MoveTarget(changeTargetNumber: number)
{
  dragPosition = Vector2.Zero();
  currentTarget = changeTargetNumber;
  beforeTransform.position = cameraParent.position;
  beforeTransform.rotationQuaternion =
    cameraParent.rotationQuaternion!.fromRotationMatrix(cameraParent.computeWorldMatrix(true));

  lerpCount = 0;
}

// 동적 화면 UI
function UI(canvasElement: Element)
{
  if (currentTarget != 0)
  {
    for (let i: number = 0; i < targetButtons.length; i++)
    {
      targetButtons[i].alpha > 0.1 ? targetButtons[i].alpha -= 0.05 : targetButtons[i].alpha = 0;
    }
    descriptionImage.alpha < 0.9 ? descriptionImage.alpha += 0.05 : descriptionImage.alpha = 1;
  }
  else
  {
    for (let i: number = 0; i < targetButtons.length; i++)
    {
      if (targetButtons[i].leftInPixels < 128 || targetButtons[i].leftInPixels > canvasElement.clientWidth - 128 ||
        targetButtons[i].topInPixels < 64 || targetButtons[i].topInPixels > canvasElement.clientHeight - 64)
      {
        targetButtons[i].alpha > 0.1 ? targetButtons[i].alpha -= 0.05 : targetButtons[i].alpha = 0;
      }
      else
      {
        targetButtons[i].alpha < 0.9 ? targetButtons[i].alpha += 0.05 : targetButtons[i].alpha = 1;
      }
    }
    descriptionImage.alpha > 0.1 ? descriptionImage.alpha -= 0.05 : descriptionImage.alpha = 0;
  }
}

export { createScene };