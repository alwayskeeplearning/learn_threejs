import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import gsap from 'gsap';

let idleAction: THREE.AnimationAction | null = null;
let runAction: THREE.AnimationAction | null = null;
// 用于存储按下的按键
const keysPressed: Record<string, boolean> = {};
// 用于存储模型，以便在 animate 函数中访问
let characterModel: THREE.Group | null = null;
// 新增：用于存储角色固定大小的碰撞体
let characterCollider: THREE.Box3 | null = null;
// 新增：用于存储整个场景的边界
let sceneBounds: THREE.Box3 | null = null;

let state = 'idle';

// 新增：用于管理障碍物的结构和数组
interface Obstacle {
  mesh: THREE.Mesh;
  boundingBox: THREE.Box3;
}
// 存放不可移动的障碍物
const staticObstacles: Obstacle[] = [];
// 存放可推动的障碍物
const pushableObstacles: Obstacle[] = [];

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
// renderer.toneMapping = THREE.LinearToneMapping;
// // 设置色调映射曝光
// renderer.toneMappingExposure = 1;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 设置相机位置
camera.position.z = -9;
camera.position.y = 4;
camera.position.x = 0;
// 设置相机朝向(看向原点)
camera.lookAt(new THREE.Vector3(0, 0, 0));

// 渲染
renderer.render(scene, camera);

// // 添加世界坐标轴
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
// 添加网格辅助器
// const gridHelper = new THREE.GridHelper(20, 20);
// // gridHelper.material.opacity = 0.8;
// gridHelper.material.transparent = true;
// scene.add(gridHelper);

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
let mixer1: THREE.AnimationMixer | null = null;
let mixer2: THREE.AnimationMixer | null = null;
let mixer3: THREE.AnimationMixer | null = null;
const clock = new THREE.Clock();
// 动画
function animate() {
  // 获取时间差
  const delta = clock.getDelta();

  // -- 新的"坦克式操控"逻辑 --
  if (characterModel && characterCollider && sceneBounds) {
    // 确保碰撞体和场景边界也已加载
    const isSprinting = keysPressed.shift === true;
    const moveSpeed = isSprinting ? 6 : 3.5; // 单位：米/秒
    const rotationSpeed = 5; // 单位：弧度/秒

    // 1. 处理转向 (A/D键)，转向总是成功的
    if (keysPressed['a']) {
      characterModel.rotateY(rotationSpeed * delta);
    }
    if (keysPressed['d']) {
      characterModel.rotateY(-rotationSpeed * delta);
    }

    // 2. 处理前进/后退 (W/S键)
    const moveIntent = keysPressed['w'] || keysPressed['s'];
    if (moveIntent) {
      // a. 计算移动向量
      const moveDirection = keysPressed['w'] ? 1 : -1;
      const animationSpeed = isSprinting ? 1.2 : 1;
      runAction!.timeScale = moveDirection * animationSpeed;
      const forward = new THREE.Vector3();
      characterModel.getWorldDirection(forward);
      const moveVector = forward.multiplyScalar(moveSpeed * delta * moveDirection);

      // b. 准备碰撞检测所需信息
      // --- 修改：使用固定的碰撞体，而不是每帧都重新计算 ---
      const characterBoundingBox = characterCollider.clone().translate(characterModel.position);
      const nextCharacterBoundingBox = characterBoundingBox.clone().translate(moveVector);
      const nextPosition = characterModel.position.clone().add(moveVector);

      let canMove = true;

      // c. 执行连锁碰撞检测
      // c.1 检查是否会撞到世界边界 (使用 sceneBounds)
      if (nextPosition.x < sceneBounds.min.x || nextPosition.x > sceneBounds.max.x || nextPosition.z < sceneBounds.min.z || nextPosition.z > sceneBounds.max.z) {
        canMove = false;
      }

      // c.2 检查是否会撞到静态障碍物 (墙)
      if (canMove) {
        for (const obstacle of staticObstacles) {
          if (nextCharacterBoundingBox.intersectsBox(obstacle.boundingBox)) {
            canMove = false;
            break;
          }
        }
      }

      // c.3 检查是否会撞到并推动可移动障碍物 (箱子)
      let pushedObject: Obstacle | null = null;
      let canPush = true;
      if (canMove) {
        for (const obstacle of pushableObstacles) {
          if (nextCharacterBoundingBox.intersectsBox(obstacle.boundingBox)) {
            // --- 新增：方向性判断 ---
            // 1. 获取从角色指向障碍物的向量
            const toObstacle = new THREE.Vector3().subVectors(obstacle.mesh.position, characterModel.position).normalize();
            // 2. 获取角色当前的前进方向
            const characterDirection = new THREE.Vector3();
            characterModel.getWorldDirection(characterDirection);
            // 3. 计算点积，只有当角色朝向障碍物移动时（点积 > 0），才认为是"推"
            if (characterDirection.dot(toObstacle) <= 0) {
              // 角色不是朝向箱子移动（比如后退或侧移），视为撞墙
              canMove = false;
              break;
            }
            // --- 方向性判断结束 ---

            pushedObject = obstacle; // 标记这个箱子被撞到了
            // 检查这个箱子被推动后是否会遇到阻碍
            const nextBoxPosition = obstacle.mesh.position.clone().add(moveVector);
            const nextBoxBoundingBox = obstacle.boundingBox.clone().translate(moveVector);
            // 检查箱子是否会超出边界 (使用 sceneBounds)
            if (nextBoxPosition.x < sceneBounds.min.x || nextBoxPosition.x > sceneBounds.max.x || nextBoxPosition.z < sceneBounds.min.z || nextBoxPosition.z > sceneBounds.max.z) {
              canPush = false;
              break;
            }
            // 检查箱子是否会撞到墙
            for (const staticObs of staticObstacles) {
              if (nextBoxBoundingBox.intersectsBox(staticObs.boundingBox)) {
                canPush = false;
                break;
              }
            }
            if (!canPush) break;
            // (简化处理：暂不考虑推一个箱子撞到另一个可推箱子的情况)
          }
        }
      }

      // d. 根据检测结果，执行最终的移动
      if (canMove) {
        if (pushedObject) {
          // 如果撞到了箱子，并且可以推动
          if (canPush) {
            // 同时移动箱子和角色
            pushedObject.mesh.position.add(moveVector);
            pushedObject.boundingBox.translate(moveVector); // 更新包围盒位置
            characterModel.position.copy(nextPosition);
          }
        } else {
          // 如果什么都没撞到
          characterModel.position.copy(nextPosition);
        }
      }
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

    // 3. 根据按键意图来更新动画状态
    const isPressingMoveKey = keysPressed['w'] || keysPressed['a'] || keysPressed['s'] || keysPressed['d'];

    if (isPressingMoveKey && state !== 'run') {
      state = 'run';
      runAction!.enabled = true;
      runAction!.setEffectiveTimeScale(1);
      runAction!.setEffectiveWeight(1);
      runAction!.play();
      idleAction!.crossFadeTo(runAction!, 0.2, true);
    } else if (!isPressingMoveKey && state === 'run') {
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
  if (mixer1) {
    mixer1.update(delta);
  }
  if (mixer2) {
    mixer2.update(delta);
  }
  if (mixer3) {
    mixer3.update(delta);
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

rgbeLoader.load('/static/textures/quarry_04_puresky_4k.hdr', envMap => {
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/static/draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load('/static/models/city.glb', cityGltf => {
    // 设置球形环境贴图为折射映射
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    // 设置环境贴图
    scene.background = envMap;
    scene.environment = envMap;
    scene.add(cityGltf.scene);
    console.log(cityGltf.animations);
    mixer3 = new THREE.AnimationMixer(cityGltf.scene);
    const idleClip3 = cityGltf.animations[10];
    const idleAction3 = mixer3.clipAction(idleClip3);
    idleAction3!.enabled = true;
    idleAction3!.setEffectiveTimeScale(1);
    idleAction3!.setEffectiveWeight(1);
    idleAction3.play();
    // 2. 计算并存储整个场景的边界
    sceneBounds = new THREE.Box3().setFromObject(cityGltf.scene);

    // 3. 遍历城市场景，将其所有Mesh作为静态障碍物
    cityGltf.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        if (!object.name.includes('road') || object.name.includes('river')) {
          staticObstacles.push({
            mesh: object,
            boundingBox: new THREE.Box3().setFromObject(object),
          });
        }
      }
    });

    // 4. 在城市场景加载完毕后，再加载角色模型
    gltfLoader.load('/static/models/hilda_regular_00.glb', gltf => {
      // 将模型存到外部变量中
      characterModel = gltf.scene;
      scene.add(gltf.scene);
      characterModel.scale.set(0.6, 0.6, 0.6);
      // --- 新增：为角色创建一次性的、固定大小的碰撞体 ---
      // 1. 先计算出模型原始的包围盒来获取尺寸
      const initialBBox = new THREE.Box3().setFromObject(characterModel);
      const size = new THREE.Vector3();
      initialBBox.getSize(size);
      // 2. 创建一个基于模型尺寸的、但更稳定、略小的碰撞盒
      // 这个碰撞盒的中心在(0, height/2, 0)，并且不会随模型旋转
      characterCollider = new THREE.Box3(
        // 将X和Z轴方向的尺寸设置得略小一些，可以避免在墙角卡住，手感更好
        new THREE.Vector3(-size.x / 3, 0, -size.z / 3),
        new THREE.Vector3(size.x / 3, size.y, size.z / 3),
      );

      mixer = new THREE.AnimationMixer(gltf.scene);

      const runClip = gltf.animations[27];
      runAction = mixer.clipAction(runClip);
      const idleClip = gltf.animations[6];
      idleAction = mixer.clipAction(idleClip);

      idleAction.play();
    });
    gltfLoader.load('/static/models/black_dragon_with_idle_animation.glb', gltf => {
      const dragon = gltf.scene;
      dragon.scale.set(1.2, 1.2, 1.2);
      dragon.position.set(0, 0, 80);
      dragon.rotateY(Math.PI);
      scene.add(dragon);

      mixer1 = new THREE.AnimationMixer(gltf.scene);
      const idleClip1 = gltf.animations[0];
      const idleAction1 = mixer1.clipAction(idleClip1);
      idleAction1!.enabled = true;
      idleAction1!.setEffectiveTimeScale(1);
      idleAction1!.setEffectiveWeight(1);
      idleAction1.play();
    });
    gltfLoader.load('/static/models/phoenix_bird.glb', gltf => {
      const phoenix = gltf.scene;
      phoenix.scale.set(0.03, 0.03, 0.03);
      phoenix.position.set(-100, 40, 0);
      scene.add(phoenix);

      mixer2 = new THREE.AnimationMixer(gltf.scene);
      console.log(gltf.animations);
      const idleClip1 = gltf.animations[0];
      const idleAction1 = mixer2.clipAction(idleClip1);
      idleAction1!.enabled = true;
      idleAction1!.setEffectiveTimeScale(1);
      idleAction1!.setEffectiveWeight(1);
      idleAction1.play();

      gsap.to(phoenix.position, {
        x: 100,
        duration: 12,
        ease: 'power1.inOut',
        repeat: -1, //无限次就是-1
        yoyo: true, // 是否反向播放
        // delay: 2, // 延迟时间 秒
        onComplete: () => {
          console.log('动画完成');
        },
        onStart: () => {
          console.log('动画开始');
        },
        onUpdate: () => {
          console.log('动画更新');
        },
        onRepeat: () => {
          phoenix.rotateY(Math.PI);
          console.log('动画重复');
        },
      });
    });
  });
});

window.addEventListener(
  'keydown',
  e => {
    const key = e.key.toLowerCase();
    keysPressed[key] = true;
  },
  true,
);

window.addEventListener(
  'keyup',
  e => {
    const key = e.key.toLowerCase();
    delete keysPressed[key];
  },
  true,
);
