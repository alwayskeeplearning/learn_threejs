import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

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
camera.position.z = 7;
camera.position.y = 2;
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
gridHelper.material.opacity = 0.3;
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
let mixer1: THREE.AnimationMixer | null = null;
const clock = new THREE.Clock();
// 动画
function animate() {
  // 获取时间差
  const delta = clock.getDelta();
  // 更新轨道控制器
  controls.update();
  if (mixer) {
    mixer.update(delta);
  }
  if (mixer1) {
    mixer1.update(delta);
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gui = new GUI();
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 设置球形环境贴图为折射映射
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = new THREE.Color(0xcccccc);
  scene.environment = envMap;
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/static/draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load('/static/models/moon.glb', gltf => {
    scene.add(gltf.scene);
    console.log(gltf.scene);

    mixer1 = new THREE.AnimationMixer(gltf.scene);
    const values = [true, false, true, false, true];
    const booleanKeyframeTrack = new THREE.BooleanKeyframeTrack('Sketchfab_model.visible', [0, 1, 2, 3, 4], values as unknown as ArrayLike<number>);
    mixer1 = new THREE.AnimationMixer(gltf.scene);
    // 创建动画剪辑
    const clip = new THREE.AnimationClip('bool', 4, [booleanKeyframeTrack]);
    // 创建动画动作
    const action = mixer1.clipAction(clip);
    // 播放动画
    action.play();
  });
});

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);
mesh.name = 'cube';
scene.add(mesh);

// 创建位移关键帧动画
const positionKeyframeTrack = new THREE.KeyframeTrack('cube.position', [0, 1, 2, 3, 4], [0, 0, 0, 2, 0, 0, 4, 0, 0, 2, 0, 0, 0, 0, 0]);
// 创建旋转关键帧动画
const quaternion1 = new THREE.Quaternion();
// quaternion1.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
quaternion1.setFromEuler(new THREE.Euler(0, 0, 0));
const quaternion2 = new THREE.Quaternion();
// quaternion2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
quaternion2.setFromEuler(new THREE.Euler(Math.PI, 0, 0));
const quaternion3 = new THREE.Quaternion();
// quaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
quaternion3.setFromEuler(new THREE.Euler(0, 0, 0));
const quaternionArray = quaternion1.toArray().concat(quaternion2.toArray()).concat(quaternion3.toArray());

const rotationKeyframeTrack = new THREE.QuaternionKeyframeTrack('cube.quaternion', [0, 2, 4], quaternionArray);

// 创建布尔关键帧动画
const values = [true, false, true, false, true];
const booleanKeyframeTrack = new THREE.BooleanKeyframeTrack('cube.visible', [0, 1, 2, 3, 4], values as unknown as ArrayLike<number>);

// 创建动画混合器
mixer = new THREE.AnimationMixer(mesh);
// 创建动画剪辑
const clip = new THREE.AnimationClip('move', 4, [positionKeyframeTrack, rotationKeyframeTrack, booleanKeyframeTrack]);
// 创建动画动作
const action = mixer.clipAction(clip);
// 播放动画
action.play();
