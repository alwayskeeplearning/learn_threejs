import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
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
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建纹理加载器
const textureLoader = new THREE.TextureLoader();
// 加载贴图
const texture = textureLoader.load('/static/textures/watercover/CityNewYork002_COL_VAR1_1K.png');
// 加载ao贴图（环境遮蔽贴图）目的是模拟环境光遮蔽 影响阴影和深度感 效果增强立体感
const aoTexture = textureLoader.load('/static/textures/watercover/CityNewYork002_AO_1K.jpg');
// 加载透明度贴图
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const alphaTexture = textureLoader.load('/static/textures/door/height.jpg');
// 加载光照贴图
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const lightTexture = textureLoader.load('/static/textures/colors.png');

// 加载高光贴图 目的是控制表面反射 影响光泽和反射强度 效果控制材质质感
const specularTexture = textureLoader.load('/static/textures/watercover/CityNewYork002_GLOSS_1K.jpg');

const rgbeLoader = new RGBELoader();
// 加载hdr环境贴图
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 设置球形环境贴图
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 设置环境贴图
  scene.background = envMap;
  // 设置plane的环境贴图
  planeMaterial.envMap = envMap;
});

// 创建平面几何体
const planeGeometry = new THREE.PlaneGeometry(1, 1);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  // 设置双面渲染
  side: THREE.DoubleSide,
  map: texture,
  // 允许透明
  transparent: true,
  // 设置ao贴图
  aoMap: aoTexture,
  // // 设置ao贴图强度
  // aoMapIntensity: 1,
  // // 设置透明度贴图
  // alphaMap: alphaTexture,
  // // 设置光照贴图
  // lightMap: lightTexture,
  // 设置反射强度
  reflectivity: 0.5,
  // 设置高光贴图
  specularMap: specularTexture,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

scene.add(plane);

// 设置相机位置
camera.position.z = 1.2;
camera.position.y = 0.5;
camera.position.x = 0.2;
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
gui.add(planeMaterial, 'aoMapIntensity').min(0).max(1).step(0.1).name('环境遮蔽贴图强度');
