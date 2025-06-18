import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

let idleAction: THREE.AnimationAction | null = null;
let runAction: THREE.AnimationAction | null = null;
// 用于存储按下的按键
const keysPressed: Record<string, boolean> = {};
// 用于存储模型，以便在 animate 函数中访问
let characterModel: THREE.Group | null = null;

let state = 'idle';

// 视角设置
const cameraSettings = {
  view: '第三人称',
};

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75, // 视角
  // 宽高比
  window.innerWidth / window.innerHeight,
  // 近截面
  0.1,
  // 远截面
  1000,
);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 抗锯齿
});
renderer.shadowMap.enabled = true;
// // 设置色调映射
// renderer.toneMapping = THREE.ReinhardToneMapping;
// // 设置色调映射曝光
// renderer.toneMappingExposure = 1;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 设置相机位置
camera.position.z = 9;
camera.position.y = 4;
camera.position.x = 0;
// 设置相机朝向(看向原点)
camera.lookAt(new THREE.Vector3(0, 0, 0));

// 渲染
renderer.render(scene, camera);

// 添加世界坐标轴
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
// 添加网格辅助器
const gridHelper = new THREE.GridHelper(20, 20);
gridHelper.material.opacity = 0.8;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器阻尼
controls.enableDamping = true;
// 设置阻尼系数
controls.dampingFactor = 0.25;
// 设置是否启用缩放
controls.enableZoom = true;

// 设置是否启用平移
controls.enablePan = false;
// 设置控制器目标
controls.target.set(0, 0, 0);

let mixer: THREE.AnimationMixer | null = null;
const clock = new THREE.Clock();
// 动画
function animate() {
  // 获取时间差
  const delta = clock.getDelta();
  let isMoving = false; // 用于标记本帧是否有移动或转向

  // -- 新的"坦克式操控"逻辑 --
  if (characterModel) {
    const moveSpeed = 3; // 单位：米/秒
    const rotationSpeed = 4; // 单位：弧度/秒
    const boundary = 10; // 网格边界, GridHelper(20, 20) 的范围是 -10 到 10

    // 1. 处理转向 (A/D键)
    if (keysPressed['a']) {
      characterModel.rotateY(rotationSpeed * delta);
      isMoving = true;
    }
    if (keysPressed['d']) {
      characterModel.rotateY(-rotationSpeed * delta);
      isMoving = true;
    }

    // 2. 处理前进/后退 (W/S键)
    if (keysPressed['w']) {
      runAction!.timeScale = 1;
      const forward = new THREE.Vector3();
      characterModel.getWorldDirection(forward);
      const nextPosition = characterModel.position.clone().add(forward.multiplyScalar(moveSpeed * delta));
      // 边界检查
      if (Math.abs(nextPosition.x) <= boundary && Math.abs(nextPosition.z) <= boundary) {
        characterModel.position.copy(nextPosition);
      }
      isMoving = true;
    }
    if (keysPressed['s']) {
      runAction!.timeScale = -1;
      const backward = new THREE.Vector3();
      characterModel.getWorldDirection(backward);
      const nextPosition = characterModel.position.clone().add(backward.multiplyScalar(-moveSpeed * delta));
      // 边界检查
      if (Math.abs(nextPosition.x) <= boundary && Math.abs(nextPosition.z) <= boundary) {
        characterModel.position.copy(nextPosition);
      }
      isMoving = true;
    }

    // --- 相机逻辑 ---
    if (cameraSettings.view === '第三人称') {
      controls.enabled = true;
      const targetPosition = characterModel.position.clone();
      targetPosition.y += 1; // 让控制器看向模型的身体中间，而不是脚底
      controls.target.copy(targetPosition);
      // 只在第三人称模式下更新轨道控制器
      controls.update();
    } else {
      // 第一人称
      controls.enabled = false;
      // 1. 计算相机应该在的世界坐标
      const cameraOffset = new THREE.Vector3(0, 1.3, 0.6); // y是高度, z是稍微靠后避免穿模
      const cameraPosition = cameraOffset.clone().applyMatrix4(characterModel.matrixWorld);
      camera.position.copy(cameraPosition);

      // 2. 让相机朝向与模型相同的方向
      camera.quaternion.copy(characterModel.quaternion);
      camera.rotateY(Math.PI);
    }

    // 3. 根据是否在移动来更新动画状态
    if (isMoving && state !== 'run') {
      state = 'run';
      runAction!.enabled = true;
      runAction!.setEffectiveTimeScale(1);
      runAction!.setEffectiveWeight(1);
      runAction!.play();
      idleAction!.crossFadeTo(runAction!, 0.2, true);
    } else if (!isMoving && state === 'run') {
      state = 'idle';
      idleAction!.enabled = true;
      idleAction!.setEffectiveTimeScale(1);
      idleAction!.setEffectiveWeight(1);
      idleAction!.play();
      runAction!.crossFadeTo(idleAction!, 0.2, true);
    }
  }
  // -- 逻辑结束 --

  // 更新轨道控制器 (从这里移除)
  // controls.update();
  if (mixer) {
    mixer.update(delta);
  }
  // 渲染
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate();

// 监听窗口大小变化
window.addEventListener('resize', () => {
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 更新相机
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

const gui = new GUI();
gui.add(cameraSettings, 'view', ['第三人称', '第一人称']).name('视角');
const rgbeLoader = new RGBELoader();

rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 设置球形环境贴图为折射映射
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = new THREE.Color(0x333333);
  scene.environment = envMap;
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/static/draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load('/static/models/hilda_regular_00.glb', gltf => {
    // 将模型存到外部变量中
    characterModel = gltf.scene;
    scene.add(gltf.scene);
    mixer = new THREE.AnimationMixer(gltf.scene);
    console.log(mixer);
    const runClip = gltf.animations[27];
    runAction = mixer.clipAction(runClip);
    const idleClip = gltf.animations[6];
    idleAction = mixer.clipAction(idleClip);

    idleAction.play();

    // setTimeout(() => {
    //   // 设置runAction为有效动作
    //   runAction!.enabled = true;
    //   // 设置runAction的时间缩放
    //   runAction!.setEffectiveTimeScale(1);
    //   // 设置runAction的权重
    //   runAction!.setEffectiveWeight(1);
    //   runAction?.play();
    //   // 交叉淡入runAction
    //   idleAction!.crossFadeTo(runAction!, 0.2, true);
    // }, 2000);
  });
});

window.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  keysPressed[key] = true;
});

window.addEventListener('keyup', e => {
  const key = e.key.toLowerCase();
  delete keysPressed[key];
});
