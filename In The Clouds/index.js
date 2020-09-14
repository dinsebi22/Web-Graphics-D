const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
let color = "#226be0";
renderer.setClearColor(color, 1);

let scene = new THREE.Scene();
const n = noise;

function setFog(color, near, far) {
  scene.fog = new THREE.Fog(color, near, far);
}

var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  500000
);
camera.position.z = 1100;
camera.position.y = 0;

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

function generatePlane(sizeX, sizeY, definitionX, definitionY) {
  let geometry = new THREE.PlaneGeometry(
    sizeX,
    sizeY,
    definitionX,
    definitionY
  );
  let material = new THREE.MeshBasicMaterial({ color: "#111" });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x -= Math.PI * 0.5;
  // material.wireframe = true;
  scene.add(mesh);
  return mesh;
}

let paramsForWork = {
  detail: 100,
  outer_multiplier: 50,
  speed_x: 2,
};
let widthCount = 300;
let heightCount = 300;

let plainPoints1 = generatePlane(4000, 4000, widthCount, heightCount);
let plainPoints2 = generatePlane(4000, 4000, widthCount, heightCount);

plainPoints1.position.y = -200;

plainPoints2.position.y = 200;
plainPoints2.rotation.x = Math.PI * 0.5;
plainPoints2.rotation.z = Math.PI;

function makeWave(vertex, i, time) {
  let xoff = vertex.x / paramsForWork.detail + time;
  let yoff = vertex.y / paramsForWork.detail + time * paramsForWork.speed_x;
  let rand = n.perlin2(yoff, xoff) * paramsForWork.outer_multiplier;
  vertex.z = rand;
}

//
var gui = new dat.GUI();

gui.add(paramsForWork, "outer_multiplier").min(1).max(100).step(1).listen();
gui.add(paramsForWork, "speed_x").min(1).max(40).step(1).listen();
gui.add(paramsForWork, "detail").min(50).max(250).step(1).listen();

gui.close();

function initWave(time) {
  for (let i = 0; i < plainPoints1.geometry.vertices.length; i++) {
    makeWave(plainPoints1.geometry.vertices[i], i, time);
    makeWave(plainPoints2.geometry.vertices[i], i, time);
  }
}

initWave();

function animate(time) {
  time *= 0.0001;

  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

  initWave(time);

  plainPoints1.geometry.verticesNeedUpdate = true;
  plainPoints2.geometry.verticesNeedUpdate = true;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

setFog(color, 0, 1000);

requestAnimationFrame(animate);
