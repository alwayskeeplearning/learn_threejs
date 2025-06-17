// 导入threejs
import * as THREE from 'three';
// 导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// 导入lil.gui
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
// 导入hdr加载器
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { CSM } from 'three/addons/csm/CSM.js';
import { CSMHelper } from 'three/addons/csm/CSMHelper.js';

const params = {
  orthographic: false,
  fade: false,
  far: 1000,
  mode: 'practical',
  lightX: -1,
  lightY: -1,
  lightZ: -1,
  margin: 100,
  lightFar: 1000,
  lightNear: 1,
  autoUpdateHelper: true,
  updateHelper: function () {
    csmHelper.update();
  },
};
// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  45, // 视角
  window.innerWidth / window.innerHeight, // 宽高比
  0.1, // 近平面
  1000, // 远平面
);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 开启抗锯齿
});
// 设置渲染器允许投射阴影
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.body.appendChild(renderer.domElement);

// 设置相机位置
camera.position.z = 15;
camera.position.y = 2.4;
camera.position.x = 0.4;
camera.lookAt(0, 0, 0);

// 添加世界坐标辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置带阻尼的惯性
controls.enableDamping = true;
// 设置阻尼系数
controls.dampingFactor = 0.05;
// 设置旋转速度
// controls.autoRotate = true;
controls.addEventListener('change', () => {
  renderer.render(scene, camera);
});

// 添加平行光
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(params.lightX, params.lightY, params.lightZ).normalize().multiplyScalar(-200);
// 默认平行光的目标是原点
directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight);

// 设置光投射阴影
// directionalLight.castShadow = true;

// 添加平行光辅助器
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper);

// console.log(directionalLight);
// directionalLight.shadow.camera.left = -10;
// directionalLight.shadow.camera.right = 10;
// directionalLight.shadow.camera.top = 10;
// directionalLight.shadow.camera.bottom = -10;
// directionalLight.shadow.camera.near = 0.5;
// directionalLight.shadow.camera.far = 50;
// // 设置阴影的纹理大小
// directionalLight.shadow.mapSize.width = 2048;
// directionalLight.shadow.mapSize.height = 2048;

const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(cameraHelper);

const csm = new CSM({
  maxFar: params.far,
  cascades: 4,
  // mode: params.mode,
  parent: scene,
  shadowMapSize: 2048,
  lightDirection: new THREE.Vector3(params.lightX, params.lightY, params.lightZ).normalize(),
  camera: camera,
});
csm.fade = true;
// 更新级联阴影
csm.updateFrustums();
// 渲染函数
function animate() {
  controls.update();
  camera.updateMatrixWorld();
  csm.update();
  requestAnimationFrame(animate);
  // 渲染
  renderer.render(scene, camera);
}
const csmHelper = new CSMHelper(csm);
scene.add(csmHelper);
animate();

// 监听窗口变化
window.addEventListener('resize', () => {
  // 重置渲染器宽高比
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 重置相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新相机投影矩阵
  camera.updateProjectionMatrix();
});

// 创建GUI
const gui = new GUI();

// rgbeLoader 加载hdr贴图
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/static/textures/Video_Copilot-Back Light_0007_4k.hdr', envMap => {
  // 设置球形贴图
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  // envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = envMap;
  // 设置环境贴图
  // scene.environment = envMap;
});

const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
const material1 = new THREE.MeshPhysicalMaterial({
  color: 0xccccff,
});
csm.setupMaterial(material1);
const torusKnot = new THREE.Mesh(geometry, material1);
torusKnot.position.set(4, 0, 0);
scene.add(torusKnot);
torusKnot.receiveShadow = true;
torusKnot.castShadow = true;

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const material2 = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
});
csm.setupMaterial(material2);
const sphere = new THREE.Mesh(sphereGeometry, material2);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const material3 = new THREE.MeshPhysicalMaterial({
  color: 0xffcccc,
});
csm.setupMaterial(material3);
const box = new THREE.Mesh(boxGeometry, material3);
box.position.set(-4, 0, 0);
scene.add(box);
box.receiveShadow = true;
box.castShadow = true;

// 创建平面
const planeGeometry = new THREE.PlaneGeometry(24, 24, 1, 1);
const planeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x999999,
});
csm.setupMaterial(planeMaterial);
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
planeMesh.position.set(0, -1, 0);
scene.add(planeMesh);
// 设置接收阴影
planeMesh.receiveShadow = true;
planeMesh.castShadow = true;

// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);
gui.add(sphere.position, 'z', -10, 10).name('z');
gui.add(csm, 'fade').onChange(value => {
  csm.fade = value;
  csm.updateFrustums();
});
