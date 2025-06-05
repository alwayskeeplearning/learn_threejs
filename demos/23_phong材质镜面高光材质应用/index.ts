import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

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
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 设置相机位置
camera.position.z = 0;
camera.position.y = 1.2;
camera.position.x = 0;
// 设置相机朝向(看向原点)
camera.lookAt(new THREE.Vector3(0, 0, 0));

// 渲染
renderer.render(scene, camera);

// 添加世界坐标轴
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器阻尼
controls.enableDamping = true;
// 设置阻尼系数
controls.dampingFactor = 0.25;
// 设置是否启用缩放
controls.enableZoom = true;
// 设置是否启用平移
controls.enablePan = true;

// 动画
function animate() {
  requestAnimationFrame(animate);
  // 更新轨道控制器
  controls.update();
  // 渲染
  renderer.render(scene, camera);
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

const rgbeLoader = new RGBELoader();
// 加载hdr环境贴图
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 设置球形环境贴图
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 设置环境贴图
  scene.background = envMap;
  scene.environment = envMap;

  planeMaterial.envMap = envMap;
});

// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// 添加点光源
const pointLight = new THREE.PointLight(0xffffff, 5);
pointLight.position.set(0, 1, 0);
scene.add(pointLight);

// 添加纹理
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/static/textures/watercover/CityNewYork002_COL_VAR1_1K.png');
texture.colorSpace = THREE.SRGBColorSpace;
// 添加高光贴图
const specularTexture = textureLoader.load('/static/textures/watercover/CityNewYork002_GLOSS_1K.jpg');
// 设置法线贴图
const normalTexture = textureLoader.load('/static/textures/watercover/CityNewYork002_NRM_1K.jpg');
// 设置凹凸贴图
const displacementTexture = textureLoader.load('/static/textures/watercover/CityNewYork002_DISP_1K.jpg');
// 设置环境光遮蔽贴图
const aoTexture = textureLoader.load('/static/textures/watercover/CityNewYork002_AO_1K.jpg');

const planeGeometry = new THREE.PlaneGeometry(1, 1, 200, 200);
// const planeMaterial = new THREE.MeshPhongMaterial({
const planeMaterial = new THREE.MeshLambertMaterial({
  transparent: true,
  side: THREE.DoubleSide,
  map: texture,
  // specularMap: specularTexture,
  // normalMap: normalTexture,
  // bumpMap: displacementTexture,
  // displacementMap: displacementTexture,
  displacementScale: 0.02,
  // aoMap: aoTexture,
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
scene.add(planeMesh);

// 添加gui调试功能，支持开启/关闭上面的各种贴图
const textureControls = {
  enableMap: true,
  enableSpecularMap: false,
  enableNormalMap: false,
  enableBumpMap: false,
  enableDisplacementMap: false,
  enableAOMap: false,
};

const textureFolder = gui.addFolder('贴图控制');
textureFolder
  .add(textureControls, 'enableMap')
  .name('颜色贴图')
  .onChange(value => {
    planeMaterial.map = value ? texture : null;
    planeMaterial.needsUpdate = true;
  });
textureFolder
  .add(textureControls, 'enableSpecularMap')
  .name('高光贴图')
  .onChange(value => {
    planeMaterial.specularMap = value ? specularTexture : null;
    planeMaterial.needsUpdate = true;
  });
textureFolder
  .add(textureControls, 'enableNormalMap')
  .name('法线贴图')
  .onChange(value => {
    planeMaterial.normalMap = value ? normalTexture : null;
    planeMaterial.needsUpdate = true;
  });
textureFolder
  .add(textureControls, 'enableBumpMap')
  .name('凹凸贴图')
  .onChange(value => {
    planeMaterial.bumpMap = value ? displacementTexture : null;
    planeMaterial.needsUpdate = true;
  });
textureFolder
  .add(textureControls, 'enableDisplacementMap')
  .name('置换贴图')
  .onChange(value => {
    planeMaterial.displacementMap = value ? displacementTexture : null;
    planeMaterial.needsUpdate = true;
  });
textureFolder
  .add(textureControls, 'enableAOMap')
  .name('环境光遮蔽贴图')
  .onChange(value => {
    planeMaterial.aoMap = value ? aoTexture : null;
    planeMaterial.needsUpdate = true;
  });
textureFolder.add(planeMaterial, 'displacementScale').min(0).max(0.1).step(0.001).name('置换强度');
