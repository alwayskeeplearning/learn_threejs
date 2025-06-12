import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
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
camera.position.z = 12;
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

// 设置混合方程式 最终颜色=源颜色*源因子(占比权重)+目标颜色*目标因子(占比权重)
const gui = new GUI();

const rgbeLoader = new RGBELoader();
rgbeLoader.load('/static/textures/Alex_Hart-Nature_Lab_Bones_2k.hdr', texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

const texture1 = new THREE.TextureLoader().load('/static/textures/sprite0.png');
const planeGeometry1 = new THREE.PlaneGeometry(10, 10);
const planeMaterial1 = new THREE.MeshBasicMaterial({
  map: texture1,
  side: THREE.DoubleSide,
  transparent: true,
});
planeMaterial1.blending = THREE.CustomBlending;
planeMaterial1.blendEquationAlpha = THREE.AddEquation;
planeMaterial1.blendSrcAlpha = THREE.OneFactor;
planeMaterial1.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
const planeMesh1 = new THREE.Mesh(planeGeometry1, planeMaterial1);
scene.add(planeMesh1);

// 添加gui调试
gui.add(planeMesh1.material, 'blending').name('混合模式blending').options({
  'THREE.NoBlending': THREE.NoBlending, // 不混合
  'THREE.NormalBlending': THREE.NormalBlending, // 正常混合
  'THREE.AdditiveBlending': THREE.AdditiveBlending, // 叠加混合
  'THREE.SubtractiveBlending': THREE.SubtractiveBlending, // 减法混合
  'THREE.MultiplyBlending': THREE.MultiplyBlending, // 乘法混合
  'THREE.CustomBlending': THREE.CustomBlending, // 自定义混合
});

// 设置自定义混合模式时下面的子设置才有效
// 混合方程式
gui.add(planeMesh1.material, 'blendEquation').name('混合方程式').options({
  'THREE.AddEquation': THREE.AddEquation,
  'THREE.SubtractEquation': THREE.SubtractEquation,
  'THREE.ReverseSubtractEquation': THREE.ReverseSubtractEquation,
  'THREE.MinEquation': THREE.MinEquation,
  'THREE.MaxEquation': THREE.MaxEquation,
});

// 源颜色
gui
  .add(planeMesh1.material, 'blendSrc', {
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
  .name('源颜色');

// 目标颜色
gui
  .add(planeMesh1.material, 'blendDst', {
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
  .name('目标颜色');

// 混合方程式alpha
gui
  .add(planeMesh1.material, 'blendEquationAlpha', {
    AddEquation: THREE.AddEquation,
    SubtractEquation: THREE.SubtractEquation,
    ReverseSubtractEquation: THREE.ReverseSubtractEquation,
    MinEquation: THREE.MinEquation,
    MaxEquation: THREE.MaxEquation,
  })
  .name('blendEquation透明度');

// 源颜色alpha
gui
  .add(planeMesh1.material, 'blendSrcAlpha', {
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
  .name('源颜色alpha');
// 目标颜色alpha
gui
  .add(planeMesh1.material, 'blendDstAlpha', {
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
  .name('目标颜色alpha');
