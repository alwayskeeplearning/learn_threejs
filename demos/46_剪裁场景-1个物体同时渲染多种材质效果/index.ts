import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// 创建场景
const scene = new THREE.Scene();
const scene2 = new THREE.Scene();

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
camera.position.z = 20;
camera.position.y = 3;
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

const torusKnotGeometry = new THREE.TorusKnotGeometry(6, 2, 100, 16);
const torusKnotMaterial = new THREE.MeshStandardMaterial({
  color: 0xe91e63,
  side: THREE.DoubleSide,
  clipIntersection: false,
});
const torusKnotMesh = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
scene.add(torusKnotMesh);
const torusKnotGeometry2 = new THREE.TorusKnotGeometry(6, 2, 100, 16);
const torusKnotMaterial2 = new THREE.MeshBasicMaterial({
  wireframe: true,
});
const torusKnotMesh2 = new THREE.Mesh(torusKnotGeometry2, torusKnotMaterial2);
scene2.add(torusKnotMesh2);

const params = {
  scissorWidth: window.innerWidth / 2,
};
// 动画
function animate() {
  // 更新轨道控制器
  controls.update();
  // 渲染
  renderer.setScissorTest(true);
  renderer.setScissor(0, 0, params.scissorWidth, window.innerHeight);
  renderer.render(scene, camera);
  renderer.setScissorTest(true);
  renderer.setScissor(params.scissorWidth, 0, window.innerWidth - params.scissorWidth, window.innerHeight);
  renderer.render(scene2, camera);
  renderer.setScissorTest(false);

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

const rgbeLoader = new RGBELoader();
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// 设置渲染器的localClippingEnabled为true 启动裁剪功能
renderer.localClippingEnabled = true;

gui.add(params, 'scissorWidth').min(0).max(window.innerWidth).step(1).name('裁剪宽度');
