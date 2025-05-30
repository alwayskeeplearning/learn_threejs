import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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

// 创建长方体
const boxGeometry = new THREE.BoxGeometry(1, 1, 50);
const boxMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

// // 创建线型雾
const fog = new THREE.Fog(0x999999, 0.1, 25);
scene.fog = fog;
// 创建指数雾
const fogExp2 = new THREE.FogExp2(0x999999, 0.1);
// scene.fog = fogExp2;
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
// 添加线型雾和指数雾两种切换
gui.add(scene, 'fog', {
  fog: fog,
  fogExp2: fogExp2,
});
gui.add(fog, 'near').min(0).max(100).step(0.1).name('线型雾近端');
gui.add(fog, 'far').min(0).max(100).step(0.1).name('线型雾远端');
gui.add(fogExp2, 'density').min(0).max(1).step(0.01).name('指数雾密度');
