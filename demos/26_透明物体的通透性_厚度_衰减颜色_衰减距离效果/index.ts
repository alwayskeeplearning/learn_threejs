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
camera.position.z = 3;
camera.position.y = 2;
camera.position.x = 1;
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
  // // 设置球形环境贴图为反射映射
  // envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 设置球形环境贴图为折射映射
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = envMap;
  scene.environment = envMap;
});

const thicknessTexture = new THREE.TextureLoader().load('/static/textures/diamond/diamond_emissive.png');

// 创建立方体
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
// 创建物理材质
const cubeMaterial = new THREE.MeshPhysicalMaterial({
  // 设置透明度
  transparent: true,
  // 设置透射率
  transmission: 0.95,
  // 设置粗糙度
  roughness: 0.05,
  // 设置厚度
  thickness: 2,
  // 设置厚度贴图
  thicknessMap: thicknessTexture,
  // 设置衰减颜色
  attenuationColor: new THREE.Color(0.6, 0, 0),
  // 设置衰减距离
  attenuationDistance: 1,
  // 设置折射率
  ior: 0.95,
  // 设置反射率
  reflectivity: 0.7,
});
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cubeMesh);

// 添加gui调试功能
gui.add(cubeMaterial, 'transmission').min(0).max(1).step(0.01).name('透射率');
gui.add(cubeMaterial, 'roughness').min(0).max(1).step(0.01).name('粗糙度');
gui.add(cubeMaterial, 'thickness').min(0.1).max(10).step(0.1).name('厚度');
gui.add(cubeMaterial, 'ior').min(0.1).max(2).step(0.1).name('折射率');
gui.add(cubeMaterial, 'reflectivity').min(0).max(1).step(0.01).name('反射率');
gui.addColor(cubeMaterial, 'attenuationColor').onChange(value => {
  cubeMaterial.attenuationColor = new THREE.Color(value);
});
gui.add(cubeMaterial, 'attenuationDistance').min(0.1).max(10).step(0.1).name('衰减距离');
