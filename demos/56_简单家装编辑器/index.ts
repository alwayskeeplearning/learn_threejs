import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
// 导入 TransformControls 控制器
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

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
renderer.shadowMap.enabled = true;
// 设置色调映射
renderer.toneMapping = THREE.ReinhardToneMapping;
// 设置色调映射曝光
renderer.toneMappingExposure = 1;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 设置相机位置
camera.position.z = 8;
camera.position.y = 3;
camera.position.x = 3;
// 设置相机朝向(看向原点)
camera.lookAt(new THREE.Vector3(0, 0, 0));

// 渲染
renderer.render(scene, camera);

// 添加世界坐标轴
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
// 添加网格辅助器
const gridHelper = new THREE.GridHelper(20, 20);
gridHelper.material.opacity = 0.3;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器阻尼
controls.enableDamping = true;
// 设置阻尼系数
controls.dampingFactor = 0.25;
// 设置是否启用缩放
controls.enableZoom = true;
// // 设置缩放最大距离和最小距离
// controls.minDistance = 1;
// controls.maxDistance = 3;
// // 设置垂直旋转角度范围
// controls.minPolarAngle = Math.PI / 2 - Math.PI / 10;
// controls.maxPolarAngle = Math.PI / 2 + Math.PI / 16;
// // 设置水平旋转角度范围
// controls.minAzimuthAngle = Math.PI / 2 - Math.PI / 8;
// controls.maxAzimuthAngle = Math.PI / 2 + Math.PI / 8;

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

const gui = new GUI();

// 1. 在所有 loader 外部，与 camera, scene, renderer 一起初始化 TransformControls
const transformControls = new TransformControls(camera, renderer.domElement);
let basicScene: THREE.Object3D | null = null;
const eventObj = {
  addScene() {
    // 3. 添加使用前的检查，防止模型未加载完就添加
    if (basicScene) {
      scene.add(basicScene);
      transformControls.attach(basicScene);
    } else {
      alert('基础模型尚未加载完成，请稍候...');
    }
  },
  setTranslate() {
    transformControls.setMode('translate');
  },
  setRotate() {
    transformControls.setMode('rotate');
  },
  setScale() {
    transformControls.setMode('scale');
  },
  toggleSpace() {
    transformControls.setSpace(transformControls.space === 'local' ? 'world' : 'local');
  },
  cancelMesh() {
    transformControls.detach();
  },
  translateSnapNumber: 0,
  rotateSnapNumber: 0,
  scaleSnapNumber: 0,
  isClampToGround: false,
  lightOn: true,
};
transformControls.addEventListener('change', () => {
  if (eventObj.isClampToGround) {
    transformControls.object.position.y = 0;
  }
});
transformControls.addEventListener('dragging-changed', event => {
  controls.enabled = !event.value;
});
scene.add(transformControls.getHelper());

const sceneMeshList: { name: string; model: string; object3d: THREE.Object3D }[] = [];

const rgbeLoader = new RGBELoader();
// 加载hdr环境贴图
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 设置球形环境贴图为折射映射
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  // 设置环境贴图
  scene.background = new THREE.Color(0xcccccc);
  scene.environment = envMap;

  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/static/draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load('/static/models/house/house-scene-min.glb', gltf => {
    basicScene = gltf.scene;
  });

  gui.add(eventObj, 'addScene').name('添加户型基础模型');
  gui.add(eventObj, 'setTranslate').name('操作-位移模式（T）');
  gui.add(eventObj, 'setRotate').name('操作-旋转模式（R）');
  gui.add(eventObj, 'setScale').name('操作-缩放模式（S）');
  gui.add(eventObj, 'toggleSpace').name('操作-切换空间坐标系（W）');
  gui.add(eventObj, 'cancelMesh').name('操作-取消选择（C）');
  gui
    .add(eventObj, 'translateSnapNumber', {
      不限制: 0,
      每次1: 1,
      每次3: 3,
      每次5: 5,
    })
    .name('操作-位移吸附')
    .onChange(value => transformControls.setTranslationSnap(value));
  gui
    .add(eventObj, 'rotateSnapNumber', {
      不限制: 0,
      每次45度: Math.PI / 4,
      每次90度: Math.PI / 2,
      每次180度: Math.PI,
    })
    .name('操作-旋转吸附')
    .onChange(value => transformControls.setRotationSnap(value));
  gui
    .add(eventObj, 'scaleSnapNumber')
    .min(0)
    .max(2)
    .step(0.1)
    .name('操作-缩放吸附')
    .onChange(value => transformControls.setScaleSnap(value));
  gui.add(eventObj, 'isClampToGround').name('操作-吸附地面');
  gui
    .add(eventObj, 'lightOn')
    .name('操作-灯光开关')
    .onChange(value => {
      if (value) {
        renderer.toneMappingExposure = 1;
      } else {
        renderer.toneMappingExposure = 0.1;
      }
    });
  window.addEventListener(
    'keydown',
    event => {
      if (event.key === 't') {
        eventObj.setTranslate();
      }
      if (event.key === 'r') {
        eventObj.setRotate();
      }
      if (event.key === 's') {
        eventObj.setScale();
      }
      if (event.key === 'w') {
        eventObj.toggleSpace();
      }
      if (event.key === 'c') {
        eventObj.cancelMesh();
      }
    },
    true,
  );
  const meshListFolder = gui.addFolder('家居列表');
  const meshNumber: Record<string, number> = {};
  const addMesh = function (this: { name: string; model: string }) {
    gltfLoader.load(this.model, gltf => {
      const mesh = gltf.scene;
      sceneMeshList.push({
        ...this,
        object3d: mesh,
      });
      scene.add(mesh);
      transformControls.attach(mesh);
      const meshOpt = {
        toggleMesh: () => {
          transformControls.attach(mesh);
        },
      };
      meshNumber[this.name] = meshNumber[this.name] ? meshNumber[this.name] + 1 : 1;
      meshListFolder.add(meshOpt, 'toggleMesh').name(`${this.name} ${meshNumber[this.name]}`);
    });
  };
  const meshList = [
    {
      name: '盆栽',
      model: '/static/models/house/plants-min.glb',
      addMesh,
    },
    {
      name: '单人沙发',
      model: '/static/models/house/sofa_chair_min.glb',
      addMesh,
    },
    {
      name: '小椅子',
      model: '/static/models/house/sofa_lowpoly.glb',
      addMesh,
    },
  ];
  const addMeshsFolder = gui.addFolder('添加物体');
  meshList.forEach(item => {
    addMeshsFolder.add(item, 'addMesh').name(item.name);
  });
});
