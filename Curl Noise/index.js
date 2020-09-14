import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/110/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });

const n = noise;
let paramsForWork = {
  speed: 1,
  divisor: 300,
  eps: 0.5,
  partSize: 2,
};

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = (canvas.clientWidth * pixelRatio) | 0;
  const height = (canvas.clientHeight * pixelRatio) | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function checkResizeRendererDisplay(isRendererResize) {
  if (isRendererResize) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

let scene = new THREE.Scene();
scene.background = new THREE.Color("black");
let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  50000
);
camera.position.z = 1000;
camera.position.y = 1000;
var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enablePan = false;
controls.minDistance = 500;
controls.maxDistance = 5000;

function generateStars() {
  let count = 50000;
  var geometry = new THREE.BufferGeometry();
  let positions = new Float32Array(3 * count);

  for (var i = 0; i < count; i++) {
    var dot = new THREE.Vector3();
    dot.x = THREE.Math.randFloatSpread(10) * 150;
    dot.y = THREE.Math.randFloatSpread(10) * 150;
    dot.z = THREE.Math.randFloatSpread(10) * 150;
    dot.toArray(positions, i * 3);
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // var textureLoader = new THREE.TextureLoader();
  //  var sprite = textureLoader.load( 'https://img.icons8.com/color/48/000000/filled-circle.png' );

  let material = new THREE.PointsMaterial({
    color: "white",
    size: paramsForWork.partSize,
    // map: sprite,
    // blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: false,
  });
  let mesh = new THREE.Points(geometry, material);
  scene.add(mesh);
  return mesh;
}

let pointCloud = generateStars();
var positions = pointCloud.geometry.attributes.position.array;

function computeCurl(x, y, z) {
  // var eps = 0.0001;

  var curl = new THREE.Vector3();

  //Find rate of change in YZ plane
  var n1 = n.simplex3(x, y + paramsForWork.eps, z);
  var n2 = n.simplex3(x, y - paramsForWork.eps, z);
  //Average to find approximate derivative
  var a = (n1 - n2) / (2 * paramsForWork.eps);
  var n1 = n.simplex3(x, y, z + paramsForWork.eps);
  var n2 = n.simplex3(x, y, z - paramsForWork.eps);
  //Average to find approximate derivative
  var b = (n1 - n2) / (2 * paramsForWork.eps);
  curl.x = a - b;

  //Find rate of change in XZ plane
  n1 = n.simplex3(x, y, z + paramsForWork.eps);
  n2 = n.simplex3(x, y, z - paramsForWork.eps);
  a = (n1 - n2) / (2 * paramsForWork.eps);
  n1 = n.simplex3(x + paramsForWork.eps, y, z);
  n2 = n.simplex3(x + paramsForWork.eps, y, z);
  b = (n1 - n2) / (2 * paramsForWork.eps);
  curl.y = a - b;

  //Find rate of change in XY plane
  n1 = n.simplex3(x + paramsForWork.eps, y, z);
  n2 = n.simplex3(x - paramsForWork.eps, y, z);
  a = (n1 - n2) / (2 * paramsForWork.eps);
  n1 = n.simplex3(x, y + paramsForWork.eps, z);
  n2 = n.simplex3(x, y - paramsForWork.eps, z);
  b = (n1 - n2) / (2 * paramsForWork.eps);
  curl.z = a - b;

  return curl;
}

function doSomething(time) {
  for (let index = 0, i = 0; index < positions.length; index += 3, i++) {
    let value = computeCurl(
      positions[index] / paramsForWork.divisor,
      positions[index + 1] / paramsForWork.divisor,
      positions[index + 2] / paramsForWork.divisor
    );

    positions[index] += paramsForWork.speed * value.x;
    positions[index + 1] += paramsForWork.speed * value.y;
    positions[index + 2] += paramsForWork.speed * value.z;
  }
}

var gui = new dat.GUI();
// let body = document.querySelector('body');
// body.appendChild(gui.domElement);
gui.add(paramsForWork, "speed").name("Speed").min(0).max(10).step(1).listen();
gui.add(paramsForWork, "eps").min(0.0001).max(1).step(0.0001).listen();
gui.add(paramsForWork, "divisor").min(200).max(3000).step(10).listen();

gui.close();

function animate(time) {
  time *= 0.001;
  checkResizeRendererDisplay(resizeRendererToDisplaySize(renderer));

  doSomething(time);

  controls.update();
  pointCloud.geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
