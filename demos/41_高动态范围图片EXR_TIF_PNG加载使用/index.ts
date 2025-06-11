import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UltraHDRLoader } from 'three/examples/jsm/loaders/UltraHDRLoader';
import { RGBMLoader } from 'three/examples/jsm/loaders/RGBMLoader';

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
camera.position.z = 2;
camera.position.y = 0;
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
controls.enablePan = false;
// 设置控制器目标
controls.target.set(0, 0, 0);

// 动画
function animate() {
  // 更新轨道控制器
  controls.update();
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
const planeGeometry = new THREE.PlaneGeometry(1, 1);
const planeMaterial = new THREE.MeshBasicMaterial({});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

// const exrLoader = new EXRLoader();
// exrLoader.load('/static/textures/opt/memorial/Alex_Hart-Nature_Lab_Bones_2k.exr', texture => {
//   console.log(texture);
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = texture;
//   scene.environment = texture;
//   planeMesh.material.map = texture;
//   planeMesh.material.needsUpdate = true;
// });

// // 加载tif图片 已经在新版threejs中移除支持 建议使用exr和hdr
// const ultraHDRLoader = new UltraHDRLoader();
// ultraHDRLoader.load('/static/textures/opt/memorial/memorial.tif', texture => {
//   console.log(texture);
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = texture;
//   scene.environment = texture;
// });

const rgbmLoader = new RGBMLoader();
rgbmLoader.load('/static/textures/opt/memorial/memorial.png', texture => {
  console.log(texture);
  scene.background = texture;
  scene.environment = texture;
  planeMesh.material.map = texture;
  planeMesh.material.needsUpdate = true;
});

// 添加gui调试
gui.add(renderer, 'toneMappingExposure').name('色调曝光度').min(0.1).max(2).step(0.1);

gui.add(renderer, 'toneMapping').name('色调映射').options({
  // 无色调映射
  No: THREE.NoToneMapping,
  // 线性色调映射
  Linear: THREE.LinearToneMapping,
  // Reinhard色调映射。这是一种更复杂的色调映射方式，可以更好地处理高亮度的区域。它根据整个图像的平均亮度来调整每个像素的亮度。
  Reinhard: THREE.ReinhardToneMapping,
  // Cineon色调映射。这种方法起源于电影行业，尝试模仿电影胶片的颜色响应，使得图像在颜色上看起来更富有电影感。
  Cineon: THREE.CineonToneMapping,
  // ACES Filmic色调映射。这是一种模仿电影行业中常用的色调映射算法，可以产生类似于电影的视觉效果。
  ACESFilmic: THREE.ACESFilmicToneMapping,
});
