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
  stencil: true, // 模板缓冲区
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 设置相机位置
camera.position.z = 26;
camera.position.y = 2;
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

const rgbeLoader = new RGBELoader();
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

const torusKnotGeometry = new THREE.TorusKnotGeometry(6, 2, 100, 16);
const torusKnotMaterial = new THREE.MeshPhysicalMaterial({
  side: THREE.FrontSide,
});
const torusKnotMesh = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
scene.add(torusKnotMesh);

const torusKnotMaterial2 = new THREE.MeshBasicMaterial({
  side: THREE.BackSide,
  color: 0xccccff,
  stencilWrite: true,
  stencilWriteMask: 0xff,
  stencilRef: 1,
  stencilZPass: THREE.ReplaceStencilOp,
});
const torusKnotMesh2 = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial2);
scene.add(torusKnotMesh2);
const planeGeometry = new THREE.PlaneGeometry(40, 40);
const planeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xccccff,
  metalness: 0.9,
  roughness: 0.1,
  stencilWrite: true,
  stencilRef: 1,
  stencilFunc: THREE.EqualStencilFunc,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
// 应用裁剪面法向量

scene.add(planeMesh);

const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
torusKnotMaterial.clippingPlanes = [plane];
torusKnotMaterial2.clippingPlanes = [plane];
renderer.localClippingEnabled = true;

const fold = gui.addFolder('裁剪平面');
fold.add(plane, 'constant', -10, 10, 0.1);
fold.add(plane.normal, 'x', -1, 1, 0.01);
fold.add(plane.normal, 'y', -1, 1, 0.01);
fold.add(plane.normal, 'z', -1, 1, 0.01);
