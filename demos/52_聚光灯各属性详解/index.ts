import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  45, // 视角
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
// 设置阴影
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
// 设置颜色空间
renderer.outputColorSpace = THREE.SRGBColorSpace;
// 设置色调映射
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// 设置色调映射曝光
renderer.toneMappingExposure = 1;
// 设置渲染器大小

document.body.appendChild(renderer.domElement);

// 设置相机位置
camera.position.z = 15;
camera.position.y = 2.4;
camera.position.x = 0.4;
// 设置相机朝向(看向原点)
camera.lookAt(new THREE.Vector3(0, 0, 0));

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
// 设置旋转速度
// controls.autoRotate = true;
controls.addEventListener('change', () => {
  renderer.render(scene, camera);
});
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
rgbeLoader.load('/static/textures/Video_Copilot-Back Light_0007_4k.hdr', texture => {
  console.log(texture);
  // 设置球形贴图
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;

  const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
  const material1 = new THREE.MeshPhysicalMaterial({
    color: 0xccccff,
  });
  const torusKnot = new THREE.Mesh(geometry, material1);
  torusKnot.position.set(4, 0, 0);
  scene.add(torusKnot);

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const material2 = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
  });
  const sphere = new THREE.Mesh(sphereGeometry, material2);
  // 设置阴影投射
  sphere.castShadow = true;
  // 设置阴影接收
  sphere.receiveShadow = true;
  scene.add(sphere);
  gui.add(sphere, 'castShadow').name('开启/关闭球体阴影投射');
  gui.add(sphere, 'receiveShadow').name('开启/关闭球体阴影接收');
  gui.add(sphere.position, 'z').name('球体Z').min(-10).max(10).step(0.1);

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const material3 = new THREE.MeshPhysicalMaterial({
    color: 0xffcccc,
  });
  const box = new THREE.Mesh(boxGeometry, material3);
  box.position.set(-4, 0, 0);
  scene.add(box);

  // 创建平面
  const planeGeometry = new THREE.PlaneGeometry(24, 24, 1, 1);
  const planeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x999999,
  });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.rotation.x = -Math.PI / 2;
  planeMesh.position.set(0, -2, 0);
  scene.add(planeMesh);
  // 设置接收阴影
  planeMesh.receiveShadow = true;
  planeMesh.castShadow = true;
  gui.add(planeMesh, 'castShadow').name('开启/关闭平面阴影投射');
  gui.add(planeMesh, 'receiveShadow').name('开启/关闭平面阴影接收');

  // 添加环境光 (在有 scene.environment 的情况下，这个可以酌情减少或移除)
  const environmentLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(environmentLight);
  const envLightFolder = gui.addFolder('环境光');
  envLightFolder.add(environmentLight, 'visible').name('开启/关闭');
  envLightFolder.add(environmentLight, 'intensity').name('强度').min(0).max(10).step(0.1);
  envLightFolder.addColor(environmentLight, 'color').name('颜色');

  // 添加聚光灯
  const spotLight = new THREE.SpotLight(0xffffff, 10);
  spotLight.position.set(0, 10, 0);
  spotLight.target.position.set(0, 0, 0);
  spotLight.castShadow = true;
  spotLight.angle = Math.PI / 8;
  spotLight.distance = 100;
  // 设置半影衰减
  spotLight.penumbra = 0.5;
  // 设置物理衰减速率 越大越快 暗的越近
  spotLight.decay = 0.5;
  spotLight.shadow.mapSize.set(2048, 2048);

  scene.add(spotLight);
  const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotLightHelper);
  const spotLightFolder = gui.addFolder('聚光灯');
  spotLightFolder.add(spotLight, 'visible').name('开启/关闭');
  spotLightFolder.add(spotLight, 'intensity').name('强度').min(0).max(50).step(0.1);
  spotLightFolder.addColor(spotLight, 'color').name('颜色');
  spotLightFolder
    .add(spotLight, 'angle')
    .name('角度')
    .min(0)
    .max(Math.PI)
    .step(0.1)
    .onChange(() => {
      spotLightHelper.update();
    });
  // spotLightFolder.add(spotLight, 'penumbra').name('半影').min(0).max(1).step(0.1);
  // spotLightFolder.add(spotLight, 'distance').name('距离').min(0).max(100).step(0.1);
  // spotLightFolder.add(spotLight, 'decay').name('衰减').min(0).max(10).step(0.1);
  // spotLightFolder
  //   .add(spotLight, 'shadow')
  //   .name('阴影')
  //   .onChange(() => {
  //     spotLight.castShadow = true;
  //   });
});
