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
camera.position.z = 20;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gui = new GUI();

const rgbeLoader = new RGBELoader();
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// 1、2个物体都设置模板缓冲区的写入和测试
// 2、设置模板缓冲的基准值
// 3、设置允许写入的掩码0xff
// 4、在小球上设置模板比较函数THREE.EqualStencilFunc
// 5、设置当函数比较通过时候，设置为replace替换
const plane = new THREE.PlaneGeometry(8, 8);
const planeMaterial = new THREE.MeshPhysicalMaterial({
  stencilWrite: true, //
  stencilWriteMask: 0xff, //0-255
  stencilRef: 2,
  stencilZPass: THREE.ReplaceStencilOp,
});
const planeMesh = new THREE.Mesh(plane, planeMaterial);
scene.add(planeMesh);

// 创建1个球
const sphere = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x00ff00,
  stencilWrite: true,
  stencilRef: 2,
  stencilFunc: THREE.EqualStencilFunc,
  depthTest: false,
});
const sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
sphereMesh.position.z = -10;
scene.add(sphereMesh);
