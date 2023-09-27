import { AbstractMesh, Engine, SceneLoader, TransformNode } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Color3, Color4, Matrix, Quaternion, Vector2, Vector3 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import "@babylonjs/loaders";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";


const maxDragX: number = 5;
const maxDragY: number = 3;
const dragSpeed: number = 3;
let isMouseDown: boolean = false;
let lerpCount: number = 0;

// 씬 내용
const createScene = (canvas: never) => {
  const engine = new Engine(canvas); // 엔진 제작
  const scene = new Scene(engine); // 씬 제작
  const cameraPosition: TransformNode[] = []; // 카메라 이동 위치값 배열
  const mousePosition = new Vector2(0, 0); // 화면 마우스 위치
  const goal: [[Vector3, Quaternion], [Vector3, Quaternion]] = [[new Vector3(), new Quaternion()], [new Vector3(), new Quaternion()]] // 목표 변위. [0]: before, [1]: after
  const mouseMovement = new Vector2(0, 0); // 화면 마우스 움직임
  const dragPosition = new Vector2(0, 0); // 화면 드래그로 인한 위치 보정값
  const mainCamera = new FreeCamera("mainCamera", new Vector3(0, 5, -10), scene); // 메인 카메라 생성
  const canvasElement: Element = document.querySelector(".bjsCanvas")!; // 현재 캔버스 CSS 요소
  if (canvasElement == null) { console.error("canvasElement의 값이 null입니다."); } // 에러 처리
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI"); // 전체 UI 관리 ADT
  //let currentCamera: number = 0;

  const temp: any = new TransformNode("homeNode");
  temp.position = new Vector3(0, 5, -10);
  temp.lookAt(Vector3.Zero());
  cameraPosition.push(temp);
  InitCamera(mainCamera, canvas, cameraPosition[0]);

  new HemisphericLight("light", Vector3.Up(), scene);

  scene.clearColor = new Color4(0.8, 0.85, 0.95, 1);
  InitObject(scene, cameraPosition, advancedTexture);

  InputEvent(mousePosition, mouseMovement, canvasElement, mainCamera, cameraPosition);

  // 렌더링 루프
  engine.runRenderLoop(() => {
    window.onresize = function() { engine.resize(); }

    MoveCamera(mainCamera, dragPosition, mouseMovement, mousePosition, goal);

    scene.render();
  });
};

// 카메라 초기 설정
function InitCamera(camera: FreeCamera, canvas: never, home: TransformNode) {
  camera.inputs.clear(); // 카메라에 대한 인풋 모두 제거
  camera.setTarget(Vector3.Zero()); // 바라볼 대상
  camera.attachControl(canvas, true);

  camera.position = home.position;
  if (home.rotationQuaternion == null) { console.error("canvasElement의 값이 null입니다."); } // 에러 처리
  else { camera.rotationQuaternion = home.rotationQuaternion; }
  
}

// 오브젝트 초기 설정
function InitObject(scene: Scene, cameraPosition: TransformNode[], advancedTexture: AdvancedDynamicTexture) {
  let temp: TransformNode;

  // 바닥 제작
  const ground = MeshBuilder.CreateCylinder("ground", { diameter: 20, height: 0.025 }, scene);
  const material_ground = new StandardMaterial("ground-material", scene);
  material_ground.diffuseColor = Color3.Green();
  ground.material = material_ground;

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
  temp.lookAt(new Vector3(-2, 0, 0));
  cameraPosition.push(temp);
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
  sphereButton.onPointerUpObservable.add(function() {
    alert("빨간 구체");
  });

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
  temp.lookAt(new Vector3(-2, 0, 0));
  cameraPosition.push(temp);
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
  cylinderButton.onPointerUpObservable.add(function() {
    alert("파란 원통");
  });

  // 사람 제작
  let human: AbstractMesh;
  SceneLoader.ImportMeshAsync(null, "./models/", "DummyMale.glb", scene).then((results) => {
    human = results.meshes[0];
    human.name = "__humanRoot__";
    human.id = "__humanRoot__";
    human.position = new Vector3(5, 0, -3);
    human.lookAt(Vector3.Zero());
    // 사람 노드
    temp = new TransformNode("humanNode");
    temp.parent = human;
    temp.position = new Vector3(2, 2, -10);
    temp.lookAt(new Vector3(-2, 0, 0));
    cameraPosition.push(temp);
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
    humanButton.onPointerUpObservable.add(function() {
      alert("사람");
    });
  });
}

// 인풋 이벤트
function InputEvent(mousePosition: Vector2, mouseMovement: Vector2, canvasElement: Element,
  camera: FreeCamera, cameraPosition: TransformNode[]) {
  window.addEventListener("pointermove", function(event) { // 마우스 위치에 따른 이동
    mousePosition.x = event.clientX / 1000 - 0.5;
    mousePosition.y = -event.clientY / 1000 - 0.5;
    mouseMovement.x = -event.movementX * dragSpeed / 1000;
    mouseMovement.y = event.movementY * dragSpeed / 1000;
  });

  canvasElement.addEventListener("pointerdown", function(event) { isMouseDown = true; });
  canvasElement.addEventListener("pointerup", function(event) { isMouseDown = false; });

  window.addEventListener("keydown", function(event) {
    const worldMat: Matrix = camera.getWorldMatrix();
    const scale = new Vector3, rotation = new Quaternion, position = new Vector3;

    worldMat.decompose(scale, rotation, position);

    switch (event.code) {
      case "Numpad0":
        camera.parent = cameraPosition[0];
        //camera.position = Vector3.TransformCoordinates(position, cameraPosition[0].getWorldMatrix());
        //camera.rotationQuaternion = rotation;
        break;
      
      case "Numpad1":
        camera.parent = cameraPosition[1];
        //camera.position = Vector3.TransformCoordinates(position, cameraPosition[1].getWorldMatrix());
        //camera.rotationQuaternion = rotation;
        break;

      case "Numpad2":
        camera.parent = cameraPosition[2];
        //camera.position = Vector3.TransformCoordinates(position, cameraPosition[2].getWorldMatrix());
        //camera.rotationQuaternion = rotation;
        break;

      case "Numpad3":
        camera.parent = cameraPosition[3];
        //camera.position = Vector3.TransformCoordinates(position, cameraPosition[3].getWorldMatrix());
        //camera.rotationQuaternion = rotation;
        break;
    }
  })
}

// 카메라 이동
function MoveCamera(camera: FreeCamera, dragPosition: Vector2, mouseMovement: Vector2, mousePosition: Vector2,
  goal: [[Vector3, Quaternion], [Vector3, Quaternion]]) {
  // 마우스 드래그 시 카메라 이동
  if (isMouseDown) {
    if (dragPosition.x + mouseMovement.x > maxDragX) { dragPosition.x = maxDragX; }
    else if (dragPosition.x + mouseMovement.x < -maxDragX) { dragPosition.x = -maxDragX; }
    else { dragPosition.x += mouseMovement.x; }
    if (dragPosition.y + mouseMovement.y > maxDragY) { dragPosition.y = maxDragY; }
    else if (dragPosition.y + mouseMovement.y < -maxDragY) { dragPosition.y = -maxDragY; }
    else { dragPosition.y += mouseMovement.y; }
  }



  /*
  // 카메라 자동 이동
  camera.position.x += (mousePosition.x + dragPosition.x - camera.position.x) * 0.1;
  camera.position.y += (mousePosition.y + dragPosition.y - camera.position.y) * 0.1;
  */
  // 마우스 이동에 따른 화면 2D 이동
  const mouse: number[] = [mousePosition.x + dragPosition.x, mousePosition.y + dragPosition.y]


  if (lerpCount < 100) { lerpCount++; }
  // Lerp가 일어날 때
  camera.rotationQuaternion = Quaternion.Slerp(goal[0][1], goal[1][1], lerpCount * 0.01);
  // Lerp가 일어나지 않을 때
  camera.position.x = goal[1][0].x + mouse[0];
}

function ChangeGoal() {
}


export { createScene };