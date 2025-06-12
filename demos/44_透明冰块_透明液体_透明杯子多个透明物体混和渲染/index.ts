import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
camera.position.z = -4;
camera.position.y = 3;
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

const gui = new GUI();

const rgbeLoader = new RGBELoader();
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

const gltfLoader = new GLTFLoader();
gltfLoader.load('/static/models/cup.glb', gltf => {
  const cup = gltf.scene.getObjectByName('copo_low_01_vidro_0') as THREE.Mesh;
  const water = gltf.scene.getObjectByName('copo_low_02_agua_0') as THREE.Mesh;
  const ice = gltf.scene.getObjectByName('copo_low_04_vidro_0') as THREE.Mesh;

  water.position.z = -1;

  // 设置渲染顺序
  ice.renderOrder = 1;
  water.renderOrder = 2;
  cup.renderOrder = 3;

  // 设置冰块透明效果
  const iceMaterial = ice.material as THREE.MeshStandardMaterial;
  ice.material = new THREE.MeshPhysicalMaterial({
    // 复制冰块法向贴图
    normalMap: iceMaterial.normalMap,
    // 复制冰块粗糙度贴图
    roughnessMap: iceMaterial.roughnessMap,
    // 复制冰块金属度贴图
    metalnessMap: iceMaterial.metalnessMap,
    // 设置冰块颜色
    color: new THREE.Color(0xffffff),
    // 设置粗糙度
    roughness: 0.2,
    // 设置冰块透射率
    transmission: 0.75,
    // 设置冰块透明
    transparent: true,
    // 设置冰块厚度
    thickness: 10,
    // 设置冰块折射率
    ior: 2,
  });

  const waterMaterial = water.material as THREE.MeshStandardMaterial;
  water.material = new THREE.MeshPhysicalMaterial({
    normalMap: waterMaterial.normalMap,
    roughnessMap: waterMaterial.roughnessMap,
    metalnessMap: waterMaterial.metalnessMap,
    map: waterMaterial.map,
    transparent: true,
    transmission: 0.85,
    roughness: 0.3,
    thickness: 10,
    ior: 2,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.DstColorFactor,
    blendEquationAlpha: THREE.AddEquation,
    blendSrcAlpha: THREE.SrcAlphaFactor,
    blendDstAlpha: THREE.DstAlphaFactor,
  });

  const cupMaterial = cup.material as THREE.MeshStandardMaterial;
  cup.material = new THREE.MeshPhysicalMaterial({
    normalMap: cupMaterial.normalMap,
    roughnessMap: cupMaterial.roughnessMap,
    metalnessMap: cupMaterial.metalnessMap,
    map: cupMaterial.map,
    transparent: true,
    transmission: 0.95,
    roughness: 0.1,
    thickness: 10,
    ior: 1.5,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.DstColorFactor,
    blendEquationAlpha: THREE.AddEquation,
    blendSrcAlpha: THREE.SrcAlphaFactor,
    blendDstAlpha: THREE.DstAlphaFactor,
  });

  scene.add(gltf.scene);

  gui
    .add(ice.scale, 'z')
    .min(0)
    .max(10)
    .step(0.1)
    .name('冰块缩放')
    .onChange(value => {
      ice.scale.set(value, value, value);
    });

  gui
    .add(ice.material as THREE.MeshPhysicalMaterial, 'roughness')
    .min(0)
    .max(1)
    .step(0.01)
    .name('冰块粗糙度');
  gui
    .add(ice.material as THREE.MeshPhysicalMaterial, 'transmission')
    .min(0)
    .max(1)
    .step(0.01)
    .name('冰块透射率');
  gui
    .add(ice.material as THREE.MeshPhysicalMaterial, 'thickness')
    .min(0)
    .max(10)
    .step(0.01)
    .name('冰块厚度');
  gui
    .add(ice.material as THREE.MeshPhysicalMaterial, 'ior')
    .min(1)
    .max(2)
    .step(0.01)
    .name('冰块折射率');

  gui.add(water, 'visible').name('水可见性');
  gui.add(water.position, 'z').min(-10).max(10).step(0.1).name('水位置z');
  gui
    .add(water.material as THREE.MeshPhysicalMaterial, 'roughness')
    .min(0)
    .max(1)
    .step(0.01)
    .name('水粗糙度');
  gui
    .add(water.material as THREE.MeshPhysicalMaterial, 'transmission')
    .min(0)
    .max(1)
    .step(0.01)
    .name('水透射率');
  gui
    .add(water.material as THREE.MeshPhysicalMaterial, 'thickness')
    .min(0)
    .max(10)
    .step(0.01)
    .name('水厚度');
  gui
    .add(water.material as THREE.MeshPhysicalMaterial, 'ior')
    .min(1)
    .max(2)
    .step(0.01)
    .name('水折射率');
  gui
    .add(water.material as THREE.MeshPhysicalMaterial, 'opacity')
    .min(0)
    .max(1)
    .step(0.01)
    .name('水透明度');
  gui
    .add(water.material as THREE.MeshPhysicalMaterial, 'blendEquation', {
      Add: THREE.AddEquation,
      Subtract: THREE.SubtractEquation,
      ReverseSubtract: THREE.ReverseSubtractEquation,
      Min: THREE.MinEquation,
      Max: THREE.MaxEquation,
    })
    .name('水混合模式方程');
  gui
    .add(water.material as THREE.MeshPhysicalMaterial, 'blendSrc', {
      ZeroFactor: THREE.ZeroFactor,
      OneFactor: THREE.OneFactor,
      SrcColorFactor: THREE.SrcColorFactor,
      OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
      SrcAlphaFactor: THREE.SrcAlphaFactor,
      OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
      DstAlphaFactor: THREE.DstAlphaFactor,
      OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
      DstColorFactor: THREE.DstColorFactor,
      OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
      SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
    })
    .name('水混合模式源');
  gui
    .add(water.material as THREE.MeshPhysicalMaterial, 'blendDst', {
      ZeroFactor: THREE.ZeroFactor,
      OneFactor: THREE.OneFactor,
      SrcColorFactor: THREE.SrcColorFactor,
      OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
      SrcAlphaFactor: THREE.SrcAlphaFactor,
      OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
      DstAlphaFactor: THREE.DstAlphaFactor,
      OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
      DstColorFactor: THREE.DstColorFactor,
      OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    })
    .name('水混合模式目标');
  gui
    .add(water.material, 'blendEquationAlpha', {
      AddEquation: THREE.AddEquation,
      SubtractEquation: THREE.SubtractEquation,
      ReverseSubtractEquation: THREE.ReverseSubtractEquation,
      MinEquation: THREE.MinEquation,
      MaxEquation: THREE.MaxEquation,
    })
    .name('水混合模式方程透明度');
  gui
    .add(water.material as THREE.MeshPhysicalMaterial, 'blendSrcAlpha', {
      ZeroFactor: THREE.ZeroFactor,
      OneFactor: THREE.OneFactor,
      SrcColorFactor: THREE.SrcColorFactor,
      OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
      SrcAlphaFactor: THREE.SrcAlphaFactor,
      OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
      DstAlphaFactor: THREE.DstAlphaFactor,
      OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
      DstColorFactor: THREE.DstColorFactor,
      OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
      SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
    })
    .name('水混合模式源alpha');
  gui
    .add(water.material as THREE.MeshPhysicalMaterial, 'blendDstAlpha', {
      ZeroFactor: THREE.ZeroFactor,
      OneFactor: THREE.OneFactor,
      SrcColorFactor: THREE.SrcColorFactor,
      OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
      SrcAlphaFactor: THREE.SrcAlphaFactor,
      OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
      DstAlphaFactor: THREE.DstAlphaFactor,
      OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
      DstColorFactor: THREE.DstColorFactor,
      OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    })
    .name('水混合模式目标alpha');
  // gui.add(water.material as THREE.MeshPhysicalMaterial, 'blendEquationAlpha').name('水混合模式方程alpha');

  gui.add(cup, 'visible').name('杯子可见性');
  gui
    .add(cup.scale, 'x')
    .min(0)
    .max(10)
    .step(0.1)
    .name('杯子缩放')
    .onChange(value => {
      cup.scale.set(value, value, value);
    });

  gui
    .add(cup.material as THREE.MeshPhysicalMaterial, 'roughness')
    .min(0)
    .max(1)
    .step(0.01)
    .name('杯子粗糙度');
  gui
    .add(cup.material as THREE.MeshPhysicalMaterial, 'transmission')
    .min(0)
    .max(1)
    .step(0.01)
    .name('杯子透射率');
  gui
    .add(cup.material as THREE.MeshPhysicalMaterial, 'thickness')
    .min(0)
    .max(10)
    .step(0.01)
    .name('杯子厚度');
  gui
    .add(cup.material as THREE.MeshPhysicalMaterial, 'ior')
    .min(0)
    .max(2)
    .step(0.01)
    .name('杯子折射率');
  gui
    .add(cup.material as THREE.MeshPhysicalMaterial, 'opacity')
    .min(0)
    .max(1)
    .step(0.01)
    .name('杯子透明度');
  gui
    .add(cup.material as THREE.MeshPhysicalMaterial, 'blendEquation', {
      Add: THREE.AddEquation,
      Subtract: THREE.SubtractEquation,
      ReverseSubtract: THREE.ReverseSubtractEquation,
      Min: THREE.MinEquation,
      Max: THREE.MaxEquation,
    })
    .name('杯子混合模式方程');
  gui
    .add(cup.material as THREE.MeshPhysicalMaterial, 'blendSrc', {
      ZeroFactor: THREE.ZeroFactor,
      OneFactor: THREE.OneFactor,
      SrcColorFactor: THREE.SrcColorFactor,
      OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
      SrcAlphaFactor: THREE.SrcAlphaFactor,
      OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
      DstAlphaFactor: THREE.DstAlphaFactor,
      OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
      DstColorFactor: THREE.DstColorFactor,
      OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
      SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
    })
    .name('杯子混合模式源');
  gui
    .add(cup.material as THREE.MeshPhysicalMaterial, 'blendDst', {
      ZeroFactor: THREE.ZeroFactor,
      OneFactor: THREE.OneFactor,
      SrcColorFactor: THREE.SrcColorFactor,
      OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
      SrcAlphaFactor: THREE.SrcAlphaFactor,
      OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
      DstAlphaFactor: THREE.DstAlphaFactor,
      OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
      DstColorFactor: THREE.DstColorFactor,
      OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    })
    .name('杯子混合模式目标');
  gui
    .add(cup.material, 'blendEquationAlpha', {
      AddEquation: THREE.AddEquation,
      SubtractEquation: THREE.SubtractEquation,
      ReverseSubtractEquation: THREE.ReverseSubtractEquation,
      MinEquation: THREE.MinEquation,
      MaxEquation: THREE.MaxEquation,
    })
    .name('杯子混合模式方程透明度');
  gui
    .add(cup.material as THREE.MeshPhysicalMaterial, 'blendSrcAlpha', {
      ZeroFactor: THREE.ZeroFactor,
      OneFactor: THREE.OneFactor,
      SrcColorFactor: THREE.SrcColorFactor,
      OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
      SrcAlphaFactor: THREE.SrcAlphaFactor,
      OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
      DstAlphaFactor: THREE.DstAlphaFactor,
      OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
      DstColorFactor: THREE.DstColorFactor,
      OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
      SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
    })
    .name('杯子混合模式源alpha');
  gui
    .add(cup.material as THREE.MeshPhysicalMaterial, 'blendDstAlpha', {
      ZeroFactor: THREE.ZeroFactor,
      OneFactor: THREE.OneFactor,
      SrcColorFactor: THREE.SrcColorFactor,
      OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
      SrcAlphaFactor: THREE.SrcAlphaFactor,
      OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
      DstAlphaFactor: THREE.DstAlphaFactor,
      OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
      DstColorFactor: THREE.DstColorFactor,
      OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    })
    .name('杯子混合模式目标alpha');

  // 冰块渲染顺序
  gui.add(ice, 'renderOrder').min(0).max(10).step(1).name('冰块渲染顺序');
  // 水渲染顺序
  gui.add(water, 'renderOrder').min(0).max(10).step(1).name('水渲染顺序');
  // 杯子渲染顺序
  gui.add(cup, 'renderOrder').min(0).max(10).step(1).name('杯子渲染顺序');
});

// // 增加水位调试
// gui.add(water.position, 'z').min(-10).max(10).step(0.1).name('水位');

// // 增加杯子缩放调试
// gui.add(cup.scale, 'x').min(0).max(10).step(0.1).name('杯子缩放x');
// gui.add(cup.scale, 'y').min(0).max(10).step(0.1).name('杯子缩放y');
// gui.add(cup.scale, 'z').min(0).max(10).step(0.1).name('杯子缩放z');
