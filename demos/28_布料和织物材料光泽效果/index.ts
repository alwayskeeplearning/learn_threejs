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
camera.position.z = 2;
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

const roughnessTexture = new THREE.TextureLoader().load('/static/textures/brick/brick_roughness.jpg');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const colorTexture = new THREE.TextureLoader().load('/static/textures/brick/brick_diffuse.jpg');

// 创建一个球体
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
// 创建一个物理材质
const sphereMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(0, 0, 0.55),
  // 设置粗糙度
  roughness: 1,
  // 设置光泽度
  sheen: 1,
  // 设置光泽度颜色
  sheenColor: new THREE.Color(1, 1, 1),
  // 设置光泽度粗糙度
  sheenRoughness: 1,
  // 设置光泽度颜色贴图
  sheenColorMap: roughnessTexture,
  // sheenColorMap: colorTexture,
});
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphereMesh);

// 添加gui调试功能
gui.add(sphereMaterial, 'roughness').min(0).max(1).step(0.01).name('粗糙度');
gui.add(sphereMaterial, 'sheen').min(0).max(1).step(0.01).name('光泽度');
gui.add(sphereMaterial, 'sheenRoughness').min(0).max(1).step(0.01).name('光泽度粗糙度');
