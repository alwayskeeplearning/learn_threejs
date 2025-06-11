import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';

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
const planeGeometry = new THREE.PlaneGeometry(1, 1);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  // 允许透明
  transparent: true,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
const ktx2Loader = new KTX2Loader().setTranscoderPath('/static/basis/').detectSupport(renderer);
ktx2Loader.load('/static/textures/opt/ktx2/Alex_Hart-Nature_Lab_Bones_2k_uastc_flipY_nomipmap.ktx2', texture => {
  console.log(texture);
  planeMesh.material.map = texture;
  planeMesh.material.needsUpdate = true;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  scene.background = texture;
  scene.environment = texture;
});

// // dds加载器
// const ddsLoader = new DDSLoader();
// ddsLoader.load(
//   "./texture/opt/env/Alex_Hart-Nature_Lab_Bones_2k_bc3_nomip.dds",
//   (texture) => {
//     console.log("dds", texture);
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     texture.flipY = true;
//     texture.needsUpdate = true;
//     scene.background = texture;
//     scene.environment = texture;
//     planeMesh.material.map = texture;
//     texture.center = new THREE.Vector2(0.5, 0.5);
//     texture.rotation = Math.PI;
//     texture.magFilter = THREE.LinearFilter;
//     texture.minFilter = THREE.LinearMipMapLinearFilter;
//     texture.anisotropy = 16;
//   }
// );

// // tga加载纹理;
// const tgaLoader = new TGALoader();
// tgaLoader.load(
//   "./texture/opt/env/Alex_Hart-Nature_Lab_Bones_2k-mipmap.tga",
//   (texture) => {
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     console.log("tga", texture);
//     scene.background = texture;
//     scene.environment = texture;
//     planeMesh.material.map = texture;
//   }
// );
