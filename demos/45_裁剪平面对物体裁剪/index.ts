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

const planesController = new THREE.Object3D();
scene.add(planesController);

const clipPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)];

const torusKnotGeometry = new THREE.TorusKnotGeometry(6, 2, 100, 16);
const torusKnotMaterial = new THREE.MeshStandardMaterial({
  color: 0xe91e63,
  side: THREE.DoubleSide,
  clippingPlanes: clipPlanes,
  clipIntersection: false,
});
const torusKnotMesh = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
scene.add(torusKnotMesh);

// 创建可视化辅助平面来代替 PlaneHelper
const planeGeom = new THREE.PlaneGeometry(20, 20);
const plane1Helper = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.2, depthWrite: false }));
plane1Helper.rotation.x = -Math.PI / 2; // 旋转以匹配(0,1,0)法线方向
planesController.add(plane1Helper);

const plane2Helper = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.2, depthWrite: false }));
plane2Helper.rotation.y = -Math.PI / 2; // 旋转以匹配(1,0,0)法线方向
planesController.add(plane2Helper);
// // 创建裁剪平面
// // 参数一：法向量，参数二：距离
// const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
// // 添加plane辅助器
// const planeHelper = new THREE.PlaneHelper(plane, 20);
// scene.add(planeHelper);
// const plane2 = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
// torusKnotMaterial.clippingPlanes = [plane, plane2];
// // 设置裁剪阴影
// // torusKnotMaterial.clipShadows = true;
// const planeHelper2 = new THREE.PlaneHelper(plane2, 20);
// scene.add(planeHelper2);
// 动画
function animate() {
  // 更新轨道控制器
  controls.update();
  // 根据“控制器”的变换，更新世界空间中数学平面的法线和常量
  clipPlanes[0].normal.set(0, 1, 0).applyQuaternion(planesController.quaternion);
  clipPlanes[0].constant = -planesController.position.dot(clipPlanes[0].normal);

  clipPlanes[1].normal.set(1, 0, 0).applyQuaternion(planesController.quaternion);
  clipPlanes[1].constant = -planesController.position.dot(clipPlanes[1].normal);
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

// 设置渲染器的localClippingEnabled为true 启动裁剪功能
renderer.localClippingEnabled = true;

// 添加gui调试参数
const fold = gui.addFolder('裁剪平面');
// fold.add(plane, 'constant', -15, 15, 0.1).name('原点位置');
// fold.add(plane.normal, 'x', -1, 1, 0.01).name('法向量x');
// fold.add(plane.normal, 'y', -1, 1, 0.01).name('法向量y');
// fold.add(plane.normal, 'z', -1, 1, 0.01).name('法向量z');
// fold.add(plane2, 'constant', -15, 15, 0.1).name('原点位置');
// fold.add(plane2.normal, 'x', -1, 1, 0.01).name('法向量x');
// fold.add(plane2.normal, 'y', -1, 1, 0.01).name('法向量y');
// fold.add(plane2.normal, 'z', -1, 1, 0.01).name('法向量z');
// // 设置并集交集
// fold.add(torusKnotMaterial, 'clipIntersection').name('并集交集');

const positionFolder = fold.addFolder('位置 (Position)');
positionFolder.add(planesController.position, 'x', -10, 10).step(0.1);
positionFolder.add(planesController.position, 'y', -10, 10).step(0.1);
positionFolder.add(planesController.position, 'z', -10, 10).step(0.1);

const rotationFolder = fold.addFolder('旋转 (Rotation)');
rotationFolder.add(planesController.rotation, 'x', -Math.PI, Math.PI).step(0.01);
rotationFolder.add(planesController.rotation, 'y', -Math.PI, Math.PI).step(0.01);
rotationFolder.add(planesController.rotation, 'z', -Math.PI, Math.PI).step(0.01);
