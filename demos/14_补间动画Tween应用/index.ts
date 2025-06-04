import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import * as TWEEN from 'three/examples/jsm/libs/tween.module';

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

// 设置相机位置
camera.position.z = 10;
camera.position.y = 2;
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
  // 更新补间动画
  TWEEN.update();
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

const sphereGeometry1 = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const sphere1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
sphere1.position.x = -4;
scene.add(sphere1);

const tween = new TWEEN.Tween(sphere1.position);
tween.to({ x: 4 }, 1000).onUpdate(() => {
  console.log(sphere1.position.x);
});
tween.easing(TWEEN.Easing.Quadratic.InOut);
// tween.repeat(2);
// tween.yoyo(true);
// tween.delay(50);
// tween.onComplete(() => {
//   console.log('完成');
// });

const tween2 = new TWEEN.Tween(sphere1.position);
tween2.to({ y: -4 }, 1000);
tween2.easing(TWEEN.Easing.Quadratic.InOut);

const tween3 = new TWEEN.Tween(sphere1.position);
tween3.to({ y: 0 }, 1000);
tween3.easing(TWEEN.Easing.Quadratic.InOut);

const tween4 = new TWEEN.Tween(sphere1.position);
tween4.to({ x: -4 }, 1000);
tween4.easing(TWEEN.Easing.Quadratic.InOut);

tween.chain(tween2);
tween2.chain(tween3);
tween3.chain(tween4);
tween4.chain(tween);
tween.start();
tween.onStart(() => {
  console.log('开始');
});
tween.onComplete(() => {
  console.log('完成');
});
tween.onStop(() => {
  console.log('停止');
});
tween.onUpdate(() => {
  console.log('更新');
});

const params = {
  stop: () => tween.stop(),
};
gui.add(params, 'stop').name('停止');
