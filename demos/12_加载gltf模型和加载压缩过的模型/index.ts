import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
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
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建gltf加载器
const gltfLoader = new GLTFLoader();
// 加载gltf模型
gltfLoader.load('/static/models/Duck.glb', gltf => {
  console.log(gltf);
  scene.add(gltf.scene);
});
// 加载压缩过的gltf模型 使用draco解压缩
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/static/draco/');
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load('/static/models/city.glb', gltf => {
  scene.add(gltf.scene);
});

const rgbeLoader = new RGBELoader();
// 加载hdr环境贴图
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 设置球形环境贴图
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 设置环境贴图
  scene.environment = envMap;
});

// 创建指数雾
const fogExp2 = new THREE.FogExp2(0x999999, 0.01);
scene.fog = fogExp2;
// 设置背景色 实现更好雾化的感觉
scene.background = new THREE.Color(0x999999);

// 设置相机位置
camera.position.z = 5;
camera.position.y = 3;
camera.position.x = 2;
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
gui.add(fogExp2, 'density').min(0).max(1).step(0.01).name('指数雾密度');
