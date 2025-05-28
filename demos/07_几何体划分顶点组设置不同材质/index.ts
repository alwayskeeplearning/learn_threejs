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

// 创建缓冲几何体
const geometry = new THREE.BufferGeometry();
// // 创建三角形顶点坐标,默认为逆时针方向 为正面 顺时针方向 为背面 正面不显示
// const vertices = new Float32Array([-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 0.0, 1.0, 0.0]);

// // 不使用索引 分别创建四边形顶点坐标 6个顶点
// const vertices = new Float32Array([-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0]);

// 创建四边形的顶点坐标 4个顶点
const vertices = new Float32Array([-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0]);
// 创建索引
const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
// 设置索引
geometry.setIndex(new THREE.BufferAttribute(indices, 1));

// 设置顶点组 使用不同的材质
geometry.addGroup(0, 3, 0);
geometry.addGroup(3, 3, 1);

// 设置顶点
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
console.log('geometry', geometry);

// 创建材质
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide, // 双面渲染
});
const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// 创建网格
const mesh = new THREE.Mesh(geometry, [material, material2]);
// 将网格添加到场景中
scene.add(mesh);

// 创建立方体
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
console.log('cubeGeometry', cubeGeometry);
const cubeMaterial0 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const cubeMaterial1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cubeMaterial2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cubeMaterial3 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cubeMaterial4 = new THREE.MeshBasicMaterial({ color: 0xff00ff });
const cubeMaterial5 = new THREE.MeshBasicMaterial({ color: 0x00ffff });

const cube = new THREE.Mesh(cubeGeometry, [cubeMaterial0, cubeMaterial1, cubeMaterial2, cubeMaterial3, cubeMaterial4, cubeMaterial5]);
cube.position.set(3, 0, 0);
scene.add(cube);

// 设置相机位置
camera.position.z = 6;
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

// 监听窗口大小变化
window.addEventListener('resize', () => {
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 更新相机
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

const eventObject = {
  fullscreen: () => {
    document.documentElement.requestFullscreen();
  },
  exitFullscreen: () => {
    document.exitFullscreen();
  },
};

const gui = new GUI();
gui.add(eventObject, 'fullscreen').name('全屏');
gui.add(eventObject, 'exitFullscreen').name('退出全屏');
