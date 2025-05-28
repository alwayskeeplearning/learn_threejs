import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

// 创建几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);
// 创建材质 基础材质 颜色绿色
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// 创建网格
const parentCube = new THREE.Mesh(geometry, material2);
const cube = new THREE.Mesh(geometry, material);
parentCube.add(cube);
parentCube.position.set(-3, 0, 0);
parentCube.scale.set(2, 2, 2);
cube.position.set(3, 0, 0);
cube.scale.set(2, 2, 2);
// parentCube.rotation.set(Math.PI / 4, Math.PI / 4, Math.PI / 4);
// cube.rotation.set(Math.PI / 4, Math.PI / 4, Math.PI / 4);
parentCube.rotation.x = Math.PI / 4;
cube.rotation.x = Math.PI / 4;

// 将网格添加到场景中
scene.add(parentCube);

// 设置相机位置
camera.position.z = 10;
camera.position.y = 10;
camera.position.x = 10;
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
  // 旋转
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  // 更新轨道控制器
  controls.update();
  // 渲染
  renderer.render(scene, camera);
}

animate();
