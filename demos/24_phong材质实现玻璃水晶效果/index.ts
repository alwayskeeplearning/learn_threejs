import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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
camera.position.z = 3;
camera.position.y = 2;
camera.position.x = 1;
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

const gui = new GUI();

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/static/textures/watercover/CityNewYork002_COL_VAR1_1K.png');
texture.colorSpace = THREE.SRGBColorSpace;

const rgbeLoader = new RGBELoader();
const gltfLoader = new GLTFLoader();
// 加载hdr环境贴图
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // // 设置球形环境贴图为反射映射
  // envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 设置球形环境贴图为折射映射
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = envMap;
  scene.environment = envMap;

  gltfLoader.load('/static/models/Duck.glb', glb => {
    scene.add(glb.scene);
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    scene.add(ambientLight);
    // // 添加点光源
    // const pointLight = new THREE.PointLight(0xffffff, 100);
    // pointLight.position.set(0, 5, 0);
    // scene.add(pointLight);

    const duckMesh = glb.scene.getObjectByName('LOD3spShape') as THREE.Mesh;
    const prevMaterial = duckMesh.material as THREE.MeshMatcapMaterial;
    duckMesh.material = new THREE.MeshPhongMaterial({
      map: prevMaterial.map,
      // 设置环境贴图
      envMap: envMap,
      // 设置折射率
      refractionRatio: 0.7,
      // 设置反射率（折射强度，根据环境贴图的强度来调整）
      reflectivity: 0.9,
    });

    // 添加折射率和反射率的gui调试功能
    gui
      .add(duckMesh.material as THREE.MeshPhongMaterial, 'refractionRatio')
      .min(0)
      .max(1)
      .step(0.01)
      .name('折射率');
    gui
      .add(duckMesh.material as THREE.MeshPhongMaterial, 'reflectivity')
      .min(0)
      .max(1)
      .step(0.01)
      .name('反射率');
  });
});
