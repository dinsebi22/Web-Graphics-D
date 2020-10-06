import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/110/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });

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
camera.position.z = 2000;
camera.position.y = 500;
var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enablePan = false;
controls.minDistance = 500;
controls.maxDistance = 5000;

function generateStars() {
  let count = 50;
  let spacing = 30;
  var geometry = new THREE.BufferGeometry();
  let positions = new Float32Array(3 * Math.pow(count, 3));
  let index = 0;
  for (var i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      for (let k = 0; k < count; k++) {
        var dot = new THREE.Vector3();
        index++;
        dot.x = spacing * i;
        dot.y = spacing * j;
        dot.z = spacing * k;
        dot.toArray(positions, index * 3);
      }
    }
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.center();

  var customUniforms1 = {
    time: { type: "f", value: 0.0 },
  };

  let cubeMaterial = new THREE.ShaderMaterial({
    uniforms: customUniforms1,
    wireframe: true,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });

  let mesh = new THREE.Points(geometry, cubeMaterial);

  scene.add(mesh);
  return mesh;
}

let pointCloud = generateStars();

function animate(time) {
  time *= 0.001;
  checkResizeRendererDisplay(resizeRendererToDisplaySize(renderer));

  pointCloud.material.uniforms["time"].value = time;

  controls.update();

  pointCloud.rotation.y = time / 5;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
