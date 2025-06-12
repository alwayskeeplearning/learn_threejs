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
const planeMesh1 = new THREE.Mesh(planeGeometry1, planeMaterial1);
scene.add(planeMesh1);

const texture2 = new THREE.TextureLoader().load('/static/textures/lensflare0_alpha.png');
const planeGeometry2 = new THREE.PlaneGeometry(10, 10);
const planeMaterial2 = new THREE.MeshBasicMaterial({
  map: texture2,
  side: THREE.DoubleSide,
  transparent: true,
});
const planeMesh2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
planeMesh2.position.z = 3;
scene.add(planeMesh2);

// 添加gui调试
const planeMeshFolder1 = gui.addFolder('planeMesh1');
planeMeshFolder1.add(planeMesh1.material, 'depthTest').name('深度测试');
planeMeshFolder1.add(planeMesh1.material, 'depthWrite').name('深度写入');
planeMeshFolder1.add(planeMesh1, 'renderOrder', 0, 10).step(1).name('渲染顺序');
planeMeshFolder1.add(planeMesh1.material, 'depthFunc').name('深度模式').options({
  'THREE.NeverDepth': THREE.NeverDepth, // 不通过深度测试
  'THREE.AlwaysDepth': THREE.AlwaysDepth, // 通过深度测试
  'THREE.LessDepth': THREE.LessDepth, // 深度值小于参考值
  'THREE.LessEqualDepth': THREE.LessEqualDepth, // 深度值小于等于参考值
  'THREE.GreaterEqualDepth': THREE.GreaterEqualDepth, // 深度值大于等于参考值
  'THREE.GreaterDepth': THREE.GreaterDepth, // 深度值大于参考值
  'THREE.NotEqualDepth': THREE.NotEqualDepth, // 深度值不等于参考值
});

const planeMeshFolder2 = gui.addFolder('planeMesh2');
planeMeshFolder2.add(planeMesh2.material, 'depthTest').name('深度测试');
planeMeshFolder2.add(planeMesh2.material, 'depthWrite').name('深度写入');
planeMeshFolder2.add(planeMesh2, 'renderOrder', 0, 10).step(1).name('渲染顺序');
planeMeshFolder2.add(planeMesh2.material, 'depthFunc').name('深度模式').options({
  'THREE.NeverDepth': THREE.NeverDepth, // 不通过深度测试
  'THREE.AlwaysDepth': THREE.AlwaysDepth, // 通过深度测试
  'THREE.LessDepth': THREE.LessDepth, // 深度值小于参考值
  'THREE.LessEqualDepth': THREE.LessEqualDepth, // 深度值小于等于参考值
  'THREE.GreaterEqualDepth': THREE.GreaterEqualDepth, // 深度值大于等于参考值
  'THREE.GreaterDepth': THREE.GreaterDepth, // 深度值大于参考值
  'THREE.NotEqualDepth': THREE.NotEqualDepth, // 深度值不等于参考值
});

/*
 * =================================================================================================
 * == 深度、透明与渲染顺序核心概念总结 (Key Concepts Summary)
 * =================================================================================================
 *
 * 通过最近的问答，我们深入探讨了3D渲染中几个最核心且容易混淆的概念。
 * 以下是我们的学习成果总结，希望能帮助你彻底巩固这些知识。
 *
 *
 * ---
 * ### 1. 核心比喻：数字画家与魔法笔记本
 * ---
 * - **画布 (Color Buffer)**: 你最终看到的屏幕，存储每个像素的颜色。
 * - **魔法笔记本 (Depth Buffer)**: 与画布同样大小，记录着已经画在画布上每个像素点的"远近"（深度值）。
 *
 *
 * ---
 * ### 2. 四大金刚：它们分别是什么，管什么？
 * ---
 *
 * #### a. 深度测试 (depthTest) - "该不该画？" (逻辑准入)
 * - **作用**: 在画一个新像素前，先查"笔记本"，比较新像素和旧像素的远近。这是实现物体正确前后遮挡的核心机制。
 * - **场景**:
 *   - `true` (默认): 标准模式。物体会被更近的物体挡住。
 *   - `false`: "莽夫模式"。不查笔记本，直接往画布上画。用于天空盒、UI元素、坐标轴等永远不应被遮挡的物体。
 * - **关键点**: 它的主要职责是处理透明物体与不透明物体之间，以及不透明物体之间的遮挡关系。
 *
 * #### b. 深度写入 (depthWrite) - "画完后，我要不要挡住别人？" (逻辑影响)
 * - **作用**: 当一个像素**通过了深度测试**并被画上后，决定是否要用这个新像素的深度值去**更新**"笔记本"。
 * - **场景**:
 *   - `true` (不透明物体默认): 更新笔记本。这样它就能挡住后面渲染的、比它更远的物体。
 *   - `false` (透明物体默认): 不更新笔记本。这样它就不会在深度上挡住它后面的物体，使得后面的物体也有机会被渲染。
 *
 * #### c. 渲染顺序 (renderOrder) - "谁先画，谁后画？" (特权命令)
 * - **作用**: 手动指定渲染的绝对顺序，数字越大的越晚被渲染。
 * - **场景**: 当多个透明物体交错，引擎的自动排序（从后往前）出错时，用它来**强制规定**正确的绘制顺序，解决透明物体之间的渲染错误。
 *
 * #### d. 不透明度 (opacity) & 贴图Alpha - "画的时候，用什么笔刷？" (视觉表现)
 * - **作用**: 这不是逻辑概念，而是**视觉概念**。它决定了当一个像素**获得绘制资格后**，它的颜色如何与画布上已有的颜色混合。
 * - **关键点**:
 *   - `opacity: 1.0` (或贴图alpha为1) 就像**100%不透明的油漆**。即使深度测试等逻辑都正确，它在视觉上也会完全**覆盖**掉后面的颜色。
 *   - `opacity < 1.0` 就像**半透明的水彩**，能和背景颜色混合，实现"看透"效果。
 *
 *
 * ---
 * ### 3. 核心问题解答："为什么我把A的深度测试/写入都关了，还是看不到后面的B？"
 * ---
 *
 * 这是因为存在两种完全不同的"遮挡"：
 * 1.  **逻辑遮挡 (深度遮挡)**: 由`depthTest`和`depthWrite`管理。你关闭它们，等于解决了逻辑上的遮挡问题，让A**获得了绘制资格**。
 * 2.  **视觉覆盖 (颜色覆盖)**: 由`opacity`管理。如果A的`opacity`是1.0，即使它获得了绘制资格，它也会像一层不透明油漆一样，在视觉上**完全覆盖**B的颜色。
 *
 * **最终结论**: 要想实现一个物体A"看穿"到后面的物体B，必须同时满足两个条件：
 * - **逻辑上不挡**: A材质必须`transparent: true`，且遵循透明物体的规则 (`depthWrite: false`)。
 * - **视觉上不盖**: A材质的`opacity`必须小于1.0 (或其贴图对应区域的alpha值小于1.0)。
 *
 * 如果多个透明物体渲染顺序有问题，再使用`renderOrder`进行手动干预。
 *
 *
 * ---
 * ### 4. 渲染队列：幕后的指挥家 (Rendering Queues)
 * ---
 *
 * 为了实现上述所有复杂的渲染逻辑，Three.js在内部维护了两个核心的"渲染列表"或称为"队列"。
 *
 * 1.  **不透明队列 (Opaque List)**:
 *     - **谁会进来**: 所有材质属性 `transparent` 为 `false` 的物体。
 *     - **处理时机**: **总是最先被渲染**。
 *     - **内部排序**: 为了最大化渲染效率 (例如尽早剔除被遮挡的像素，即Early-Z Culling)，队列内部的物体大致会**从前到后**排序。
 *     - **默认行为**: 队列中的物体默认 `depthWrite: true`。
 *
 * 2.  **透明队列 (Transparent List)**:
 *     - **谁会进来**: 所有材质属性 `transparent` 为 `true` 的物体。
 *     - **处理时机**: **总是在不透明队列处理完毕后才被渲染**。
 *     - **内部排序**: 为了保证颜色混合(Alpha Blending)的正确性，队列内部的物体会严格地**从后到前**排序（根据物体中心点离相机的距离）。这就是为什么我们通常不需要手动设置透明物体的顺序。
 *     - **默认行为**: 队列中的物体默认 `depthWrite: false`。
 *
 * **`renderOrder` 的作用域**: `renderOrder` 主要影响的是在**同一个队列内部**的排序。当两个物体的`renderOrder`值不同时，它会取代默认的排序规则，`renderOrder`值小的会先被渲染。
 *
 * **总结**: 将一个物体的 `transparent` 设置为 `true`，本质上就是做了一个决定：**"请把这个物体从'不透明队列'中拿出来，放入'透明队列'，并按照透明队列的规则去处理它"**。这也就解释了为什么这个属性一改变，`depthWrite`的默认行为和渲染顺序都会跟着发生巨大变化。
 *
 */
