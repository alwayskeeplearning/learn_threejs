import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
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
  scene.environment = envMap;
});

// 创建gltf加载器
const gltfLoader = new GLTFLoader();
// 加载压缩过的gltf模型 使用draco解压缩
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/static/draco/');
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load('/static/models/building.glb', glb => {
  scene.add(glb.scene);
  const buildingMesh = glb.scene.children[0] as THREE.Mesh;
  const buildingGeometry = buildingMesh.geometry;

  buildingMesh.position.set(0, 0, 0);

  // 创建边缘几何体
  const buildingEdgesGeometry = new THREE.EdgesGeometry(buildingGeometry);
  // // 创建线框几何体
  // const buildingWireframeGeometry = new THREE.WireframeGeometry(buildingGeometry);
  // 创建线框材质
  const buildingWireframeMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  // 创建线框网格
  const buildingEdgesMesh = new THREE.LineSegments(buildingEdgesGeometry, buildingWireframeMaterial);
  // const buildingWireframeMesh = new THREE.LineSegments(buildingWireframeGeometry, buildingWireframeMaterial);

  // 更新建筑物世界矩阵
  buildingMesh.updateMatrixWorld(true);
  // 第一种方法：直接应用建筑物世界矩阵
  buildingEdgesMesh.applyMatrix4(buildingMesh.matrixWorld);
  // buildingWireframeMesh.applyMatrix4(buildingMesh.matrixWorld);
  // 第二种方法：复制建筑物矩阵
  // buildingEdgesMesh.matrix.copy(buildingMesh.matrix);
  // buildingEdgesMesh.matrix.decompose(buildingEdgesMesh.position, buildingEdgesMesh.quaternion, buildingEdgesMesh.scale);

  // 添加建筑物和线框网格
  scene.add(buildingEdgesMesh);
  // scene.add(buildingWireframeMesh);
});
