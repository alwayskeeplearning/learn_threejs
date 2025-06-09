import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
camera.position.y = 1.7;
camera.position.x = 4.5;
// 设置相机朝向(看向原点)
camera.lookAt(new THREE.Vector3(0, 1.2, 0));

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
// 设置缩放最大距离和最小距离
controls.minDistance = 1;
controls.maxDistance = 3;
// 设置垂直旋转角度范围
controls.minPolarAngle = Math.PI / 2 - Math.PI / 10;
controls.maxPolarAngle = Math.PI / 2 + Math.PI / 16;
// 设置水平旋转角度范围
controls.minAzimuthAngle = Math.PI / 2 - Math.PI / 8;
controls.maxAzimuthAngle = Math.PI / 2 + Math.PI / 8;

// 设置是否启用平移
controls.enablePan = false;
// 设置控制器目标
controls.target.set(0, 1.2, 0);

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gui = new GUI();
const rgbeLoader = new RGBELoader();
// 加载hdr环境贴图
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // // 设置球形环境贴图为反射映射
  // envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 设置球形环境贴图为折射映射
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = new THREE.Color(0x7aaff5);
  scene.environment = envMap;

  const gltfLoader = new GLTFLoader();
  gltfLoader.load('/static/models/liveroom-scene.glb', glb => {
    scene.add(glb.scene);
  });
});
