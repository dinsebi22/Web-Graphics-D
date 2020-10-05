import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
let color = "#a6dff5";
renderer.setClearColor(color, 1);

let scene = new THREE.Scene();
const n = noise;

let xCount = 5;
let yCount = 5;

let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  500000
);

// camera.position.z = 30;
let controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 20;
camera.position.x = 20;
camera.position.y = 20;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 3;
controls.enablePan = false;
controls.minDistance = 400;
controls.maxDistance = 600;

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

function addGrassPlain() {
  let group = new THREE.Group();
  let geometry = new THREE.PlaneGeometry(2500, 2500, xCount, yCount);
  let texture = new THREE.CanvasTexture(generateTexture());

  for (let i = 0; i < 15; i++) {
    let material = new THREE.MeshBasicMaterial({
      color: "rgb(0," + (50 + i * 15) + ",0)",
      map: texture,
      // depthTest: false,
      // depthWrite: false,
      transparent: true,
    });

    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.y = i * 0.75;
    mesh.rotation.x = -Math.PI / 2;

    group.add(mesh);
  }
  scene.add(group);
  return group;
}

function generateRain() {
  let count = 10000;
  var geometry = new THREE.BufferGeometry();
  let positions = new Float32Array(3 * count);
  let speedParam = new Float32Array(count);

  for (var i = 0; i < count; i++) {
    var dot = new THREE.Vector3();
    dot.x = THREE.Math.randFloatSpread(2000);
    dot.y = 500 + THREE.Math.randFloatSpread(1500);
    dot.z = THREE.Math.randFloatSpread(2000);
    dot.toArray(positions, i * 3);

    var speed = 5 + Math.random() * 5;
    speedParam[i] = speed;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("speed", new THREE.BufferAttribute(speedParam, 1));

  var material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("vertexshader").textContent,
    fragmentShader: document.getElementById("fragmentshader").textContent,
  });
  let mesh = new THREE.Points(geometry, material);
  scene.add(mesh);
  return mesh;
}

function rain() {
  for (let index = 0, i = 0; index < positions.length; index += 3, i++) {
    positions[index + 1] -= speeds[i];

    if (positions[index] > 2000) {
      positions[index] = THREE.Math.randFloatSpread(2000);
    }

    if (positions[index + 1] < -15) {
      positions[index + 1] = 1500;
    }

    if (positions[index + 2] > 2000) {
      positions[index + 2] = THREE.Math.randFloatSpread(2000);
    }
  }
}

function addOtherPlain() {
  let geometry = new THREE.PlaneGeometry(2500, 2500, xCount, yCount);
  let material = new THREE.MeshBasicMaterial({ color: "#240000" });

  for (let i = 0; i < geometry.vertices.length; i++) {
    geometry.vertices[i].z =
      n.perlin2(geometry.vertices[i].x / 200, geometry.vertices[i].y / 200) *
      100;
  }

  let mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;

  scene.add(mesh);
}

function generateTexture() {
  let canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;

  let context = canvas.getContext("2d");

  for (let i = 0; i < 200000; i++) {
    context.fillStyle = "#fff";

    context.beginPath();
    context.arc(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() + 0.05,
      0,
      Math.PI * 2,
      true
    );
    context.fill();
  }

  context.globalAlpha = 0.075;
  context.globalCompositeOperation = "lighter";

  return canvas;
}

function move(plain) {
  for (let i = 0; i < plain.children.length; i++) {
    for (let j = 0; j < plain.children[i].geometry.vertices.length; j++) {
      plain.children[i].geometry.vertices[j].z =
        n.perlin2(
          plain.children[i].geometry.vertices[j].x / 200,
          plain.children[i].geometry.vertices[j].y / 200
        ) * 100;
    }
  }
}

let plain = addGrassPlain();

move(plain);
addOtherPlain();
setFog(color, 500, 1000);

let pointCloud = generateRain();
var positions = pointCloud.geometry.attributes.position.array;
var speeds = pointCloud.geometry.attributes.speed.array;

function animate(time) {
  time *= 0.001;

  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));
  rain();
  pointCloud.geometry.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
