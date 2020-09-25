import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
let color = "blue";
renderer.setClearColor(color, 1);

let scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  500000
);

// camera.position.z = 30;
var controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 20;
camera.position.x = 20;
camera.position.y = 20;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enablePan = false;
controls.minDistance = 50;
controls.maxDistance = 200;

// camera.rotation.z = Math.PI / 2.3;

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

function checkResizeRenderDisplay(isRenderResized) {
  if (isRenderResized) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

function setFog(color, near, far) {
  scene.fog = new THREE.Fog(color, near, far);
}

function addLight(color) {
  var directionalLight = new THREE.DirectionalLight("white", 1);
  scene.add(directionalLight);
}

function genRings() {
  let rings = [];
  var material = new THREE.MeshStandardMaterial({
    wireframe: false,
    color: "white",
  });
  console.log(material);
  for (let i = 0; i < 50; i++) {
    var geometry = new THREE.TorusBufferGeometry(50 - i, 0.4, 4, 70 - i);
    var torus = new THREE.Mesh(geometry, material);
    rings.push(torus);
    scene.add(torus);
  }
  return rings;
}

let rings = genRings();
addLight(color);
setFog(color, 0, 100);

function animate(time) {
  time *= 0.001;

  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

  for (let i = 0; i < rings.length; i++) {
    rings[i].rotation.x = (i * time) / 30;
    rings[i].rotation.y = (i * time) / 30;
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
