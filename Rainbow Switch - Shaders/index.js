import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });

let color = "#111";
renderer.setClearColor(color, 1);
let cube, sphere;

let scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  500000
);

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

camera.position.z = 33;
var controls = new OrbitControls(camera, renderer.domElement);

function init() {
  let geometry = new THREE.BoxBufferGeometry(20, 20, 20, 100, 100, 100);
  let geometry2 = new THREE.IcosahedronBufferGeometry(7, 6);

  var customUniforms1 = {
    time: { type: "f", value: 0.0 },
    factor: { type: "f", value: 0.0 },
  };
  var customUniforms2 = {
    time: { type: "f", value: 0.0 },
    factor: { type: "f", value: 0.0 },
  };

  let cubeMaterial = new THREE.ShaderMaterial({
    uniforms: customUniforms1,
    wireframe: true,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });
  let sphereMaterial = new THREE.ShaderMaterial({
    uniforms: customUniforms2,
    wireframe: true,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });

  // create a sphere and assign the material
  cube = new THREE.Points(geometry, cubeMaterial);
  sphere = new THREE.Points(geometry2, sphereMaterial);

  scene.add(cube);
  scene.add(sphere);

  render();
}

function render(time) {
  time *= 0.001;

  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

  // let there be light
  renderer.render(scene, camera);
  cube.material.uniforms["time"].value = time / 2;
  cube.material.uniforms["factor"].value = Math.sin(time) * 1.5;

  sphere.material.uniforms["time"].value = time / 2;
  sphere.material.uniforms["factor"].value = Math.cos(time) * 1.5;

  let factor = Math.abs(Math.sin(time));

  cube.scale.x = 0.3 / (0.5 + factor) + factor;
  cube.scale.y = 0.3 / (0.5 + factor) + factor;
  cube.scale.z = 0.3 / (0.5 + factor) + factor;

  sphere.scale.x = 2 - factor;
  sphere.scale.y = 2 - factor;
  sphere.scale.z = 2 - factor;

  cube.rotation.x = time;
  cube.rotation.y = time;
  cube.rotation.z = time;

  sphere.rotation.x = -time;
  sphere.rotation.y = -time;
  sphere.rotation.z = -time;

  controls.update();
  requestAnimationFrame(render);
}

init();
