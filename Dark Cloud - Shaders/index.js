import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
const n = noise;

let color = "#111";
renderer.setClearColor(color, 1);

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

let sphere;
let sphere2;

let scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  500000
);

camera.position.z = 25;
var controls = new OrbitControls(camera, renderer.domElement);
// controls.autoRotate = true;
// controls.autoRotateSpeed = 2;
controls.zoomSpeed = 0.2;
controls.update();

function init() {
  let geometry = new THREE.IcosahedronBufferGeometry(10, 6);

  var customUniforms = {
    time: { type: "f", value: 0.0 },
  };

  let material = new THREE.ShaderMaterial({
    // wireframe:true,
    uniforms: customUniforms,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });

  // create a sphere and assign the material
  sphere = new THREE.Mesh(geometry, material);
  sphere.position.x = -13;
  scene.add(sphere);
}

function init2() {
  let geometry = new THREE.IcosahedronBufferGeometry(10, 6);

  var customUniforms = {
    time: { type: "f", value: 0.0 },
  };

  let material = new THREE.ShaderMaterial({
    wireframe: true,
    uniforms: customUniforms,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });

  // create a sphere and assign the material
  sphere2 = new THREE.Mesh(geometry, material);
  sphere2.position.x = 13;

  scene.add(sphere2);

  render();
}

init();
init2();

function render(time) {
  time *= 0.0001;

  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

  sphere.rotation.x = time * 3;
  sphere.rotation.y = time * 3;

  sphere2.rotation.x = -time * 3;
  sphere2.rotation.y = -time * 3;

  sphere.material.uniforms["time"].value = time;
  sphere2.material.uniforms["time"].value = time;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
