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

const sphereGeometry1 = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const sphere1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
sphere1.position.x = -4;
scene.add(sphere1);

const sphereGeometry2 = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const sphere2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
sphere2.position.x = 0;
scene.add(sphere2);

const sphereGeometry3 = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial3 = new THREE.MeshBasicMaterial({ color: 0xff00ff });
const sphere3 = new THREE.Mesh(sphereGeometry3, sphereMaterial3);
sphere3.position.x = 4;
scene.add(sphere3);

// 创建光线投射器
const raycaster = new THREE.Raycaster();
// 创建鼠标位置
const mouse = new THREE.Vector2();

// 监听鼠标点击事件
document.addEventListener('click', event => {
  console.log(event.clientX, event.clientY);

  // 获取鼠标位置 将鼠标位置归一化转换为[-1,1]的范围内
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1; //-1到1
  mouse.y = -((event.clientY / window.innerHeight) * 2 - 1); //1到-1

  console.log(mouse);

  // 设置光线投射器
  raycaster.setFromCamera(mouse, camera);

  // 获取光线投射器与场景中所有物体的交点
  const intersects = raycaster.intersectObjects([sphere1, sphere2, sphere3]);
  console.log(intersects);
  if (intersects.length > 0) {
    if (intersects[0].object instanceof THREE.Mesh) {
      if (intersects[0].object.material.oldColor) {
        intersects[0].object.material.color.set(intersects[0].object.material.oldColor);
        intersects[0].object.material.oldColor = null;
      } else {
        intersects[0].object.material.oldColor = intersects[0].object.material.color.getHex();
        intersects[0].object.material.color.set(0xff0000);
      }
    }
  }
});
