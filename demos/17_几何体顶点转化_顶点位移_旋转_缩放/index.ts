import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
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

const uvTexture = new THREE.TextureLoader().load('/static/textures/uv_grid_opengl.jpg');
const planeGeometry = new THREE.PlaneGeometry(2, 2);
console.log(planeGeometry);
const planeMaterial = new THREE.MeshBasicMaterial({
  map: uvTexture,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.position.x = -2;
scene.add(planeMesh);

const bufferGeometry = new THREE.BufferGeometry();
console.log(bufferGeometry);
const vertices = new Float32Array([-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0]);
const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
bufferGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
// 设置uv坐标
const uvs = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
// // 计算法向量
// bufferGeometry.computeVertexNormals();
// 或者手动设置法向量
const normals = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]);
bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
bufferGeometry.translate(0, 0, 0);
bufferGeometry.rotateX(Math.PI / 2);
bufferGeometry.scale(2, 2, 2);

const material = new THREE.MeshBasicMaterial({
  map: uvTexture,
  side: THREE.DoubleSide,
});
const bufferMesh = new THREE.Mesh(bufferGeometry, material);
bufferMesh.position.x = 2;
console.log(bufferMesh);
const vertexNormalsHelper = new VertexNormalsHelper(bufferMesh, 0.3, 0x00ff00);
scene.add(vertexNormalsHelper);
scene.add(bufferMesh);

const rgbeLoader = new RGBELoader();
// 加载hdr环境贴图
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 设置球形环境贴图
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 设置环境贴图
  scene.background = envMap;
  // 设置plane的环境贴图
  planeMaterial.envMap = envMap;
  material.envMap = envMap;
});
