import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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
camera.position.z = 5;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gui = new GUI();

const rgbeLoader = new RGBELoader();
// 加载hdr环境贴图
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 设置球形环境贴图
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 设置环境贴图
  scene.background = envMap;
  // 设置环境贴图
  // 两者区别：environment主要作用于PBR物理材质 可以根据贴图计算环境光，而background主要作用于普通材质 只能设置一个颜色
  scene.environment = envMap;
});

const gltfLoader = new GLTFLoader();
gltfLoader.load('/static/models/Duck.glb', glb => {
  console.log(glb);

  scene.add(glb.scene);

  const duckMesh = glb.scene.getObjectByName('LOD3spShape') as THREE.Mesh;
  const duckGeometry = duckMesh.geometry;
  duckGeometry.center();
  // 计算包围盒
  duckGeometry.computeBoundingBox();
  // 获取包围盒
  const duckBox = duckGeometry.boundingBox!;
  // 计算世界矩阵
  duckMesh.updateMatrixWorld();
  // 获取世界矩阵
  const duckMatrix = duckMesh.matrixWorld;
  // 应用世界矩阵
  duckBox.applyMatrix4(duckMatrix);
  // 创建包围盒辅助器
  const duckBoxHelper = new THREE.Box3Helper(duckBox, 0x0000ff);
  // 获取包围盒中心点
  const center = duckBox.getCenter(new THREE.Vector3());
  console.log(center);

  scene.add(duckBoxHelper);

  // 计算包围球
  duckGeometry.computeBoundingSphere();
  // 获取包围球
  const duckSphere = duckGeometry.boundingSphere!;
  // 应用世界矩阵
  duckSphere.applyMatrix4(duckMatrix);
  // 创建包围球辅助器
  const duckSphereGeometry = new THREE.SphereGeometry(duckSphere.radius, 16, 16);
  const duckSphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
  const duckSphereHelper = new THREE.Mesh(duckSphereGeometry, duckSphereMaterial);
  duckSphereHelper.position.copy(duckSphere.center);
  scene.add(duckSphereHelper);
});
