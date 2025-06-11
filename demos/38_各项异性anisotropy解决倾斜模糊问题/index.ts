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

const gui = new GUI();
const textureLoader = new THREE.TextureLoader();

// 加载测试缩小纹理
const texture = textureLoader.load('/static/textures/brick/brick_diffuse.jpg');
texture.colorSpace = THREE.SRGBColorSpace;
// 获取各项异性过滤最大等级
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
console.log(maxAnisotropy);
// 设置各项异性过滤最大等级
texture.anisotropy = maxAnisotropy;

const planeGeometry = new THREE.PlaneGeometry(1, 1);
const planeMaterial = new THREE.MeshBasicMaterial({
  map: texture,
  // 设置纹理透明度
  transparent: true,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

// 添加gui调试测试不同缩小过滤效果
gui
  .add(texture, 'minFilter')
  .options({
    NearestFilter: THREE.NearestFilter, // 取映射到的最近像素值
    LinearFilter: THREE.LinearFilter, // 取映射到的像素的最近4个像素的平均值
    LinearMipMapLinearFilter: THREE.LinearMipMapLinearFilter, // 在各级mipmap中使用线性过滤方式，然后在最接近的两个mipmap之间进行线性插值
    LinearMipMapNearestFilter: THREE.LinearMipMapNearestFilter, // 在各级mipmap中使用线性过滤方式，然后从中选择最合适的mipmap进行采样
    NearestMipMapLinearFilter: THREE.NearestMipMapLinearFilter, // 在各级mipmap中使用最近邻过滤方式，然后在最接近的两个mipmap之间进行线性插值
    NearestMipMapNearestFilter: THREE.NearestMipMapNearestFilter, // 在各级mipmap中使用最近邻过滤方式，然后从中选择最合适的mipmap进行采样
  })
  .name('缩小过滤')
  .onChange(() => {
    texture.needsUpdate = true;
  });

gui
  .add(texture, 'anisotropy')
  .name('各项异性过滤最大等级')
  .min(1)
  .max(maxAnisotropy)
  .step(2)
  .onChange(() => {
    texture.needsUpdate = true;
  });
