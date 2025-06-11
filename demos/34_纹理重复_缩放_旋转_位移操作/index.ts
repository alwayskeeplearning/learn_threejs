import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';

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
camera.position.z = 1.5;
camera.position.y = 0;
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
const textureLoader = new THREE.TextureLoader();
// const texture = textureLoader.load('/static/textures/watercover/CityNewYork002_COL_VAR1_1K.png');
// // 设置纹理水平重复 不设置之前重复没有效果
// texture.wrapS = THREE.RepeatWrapping;
// // texture.repeat.set(4, 1);
// // 设置纹理垂直重复
// texture.wrapT = THREE.RepeatWrapping;
// texture.repeat.set(4, 4);

// 加载镜像纹理
const texture = textureLoader.load('/static/textures/amber/base_color.jpg');
// // 设置纹理水平重复 不设置之前重复没有效果
// texture.wrapS = THREE.RepeatWrapping;
// // texture.repeat.set(4, 1);
// // 设置纹理垂直重复
// texture.wrapT = THREE.RepeatWrapping;
// 设置镜像重复 镜像纹理的重复效果是镜像的，而不是重复的
// texture.wrapS = THREE.MirroredRepeatWrapping;
// texture.wrapT = THREE.MirroredRepeatWrapping;
// texture.repeat.set(4, 4);
// 设置纹理起始点偏移，默认是0，0 左下角
// texture.offset.set(0.5, 0.5);
// 设置纹理旋转，默认旋转中心点为0，0 左下角
texture.rotation = Math.PI / 4;
// 修改旋转中心点
texture.center.set(0.5, 0.5);

const planeGeometry = new THREE.PlaneGeometry(1, 1);
const planeMaterial = new THREE.MeshBasicMaterial({
  map: texture,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
