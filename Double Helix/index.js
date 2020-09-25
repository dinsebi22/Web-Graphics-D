import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
let color = "black";
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
camera.position.z = 0;
camera.position.x = 0;
camera.position.y = -50;
controls.target.set(10, 0, 25);
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 70;

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

function genPointCloud() {
  let count = 10000;
  var geometry = new THREE.BufferGeometry();
  let positions = new Float32Array(3 * count);

  for (var i = 0; i < count; i++) {
    var dot = new THREE.Vector3();
    dot.x = THREE.Math.randFloatSpread(10) * 100;
    dot.y = THREE.Math.randFloatSpread(10) * 100;
    dot.z = THREE.Math.randFloatSpread(10) * 100;
    dot.toArray(positions, i * 3);
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  var textureLoader = new THREE.TextureLoader();
  var sprite = textureLoader.load(
    "https://img.icons8.com/color/48/000000/filled-circle.png"
  );

  let material = new THREE.PointsMaterial({
    color: "white",
    fog: false,
    size: 2,
    map: sprite,
    blending: THREE.AdditiveBlending,
    transparent: false,
  });
  let mesh = new THREE.Points(geometry, material);
  scene.add(mesh);
  return mesh;
}

function genHelix(x, y, z) {
  var group = new THREE.Group();

  let helix1Curve = generatePath(Math.PI / 2, 1.5);
  let path1 = new THREE.CatmullRomCurve3(helix1Curve);
  var geometry1 = new THREE.TubeBufferGeometry(path1, 500, 1.5, 30, false);

  let helix2Curve = generatePath(Math.PI + Math.PI / 2, 1.5);
  let path2 = new THREE.CatmullRomCurve3(helix2Curve);
  var geometry2 = new THREE.TubeBufferGeometry(path2, 500, 1.5, 30, false);

  var material = new THREE.MeshBasicMaterial({
    wireframe: false,
    color: "cyan",
  });

  for (let i = 0; i < helix1Curve.length; i++) {
    let c1 = addConnection(helix1Curve[i].z, i, 0);
    let c2 = addConnection(helix1Curve[i].z, i + 0.16, 0.5);
    let c3 = addConnection(helix1Curve[i].z, i + 0.32, 1);
    let c4 = addConnection(helix1Curve[i].z, i + 0.48, 1.5);

    group.add(c1);
    group.add(c2);
    group.add(c3);
    group.add(c4);
  }

  var mesh1 = new THREE.Mesh(geometry1, material);
  var mesh2 = new THREE.Mesh(geometry2, material);
  group.add(mesh1);
  group.add(mesh2);

  group.position.x = x;
  group.position.y = y;
  group.position.z = z;

  scene.add(group);
  return group;
}

function addConnection(z, i, offset) {
  var geometry = new THREE.CylinderBufferGeometry(0.15, 0.15, 17.1, 5);
  var material = new THREE.MeshBasicMaterial({
    color: "white",
  });
  var cylinder = new THREE.Mesh(geometry, material);
  cylinder.rotation.z = (Math.PI * i) / 4.7;
  cylinder.position.z = z + offset;
  return cylinder;
}

function generatePath(offset, factor) {
  let points = [];
  let radius = 10;
  for (let i = 0; i < 100; i++) {
    let x = radius * Math.cos(i / factor + offset);
    let y = radius * Math.sin(i / factor + offset);
    let z = i * 3;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
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

let dna_one = genHelix(-15, 0, -150);
let dna_two = genHelix(35, -10, -150);
let dna_three = genHelix(15, 16, -150);

genPointCloud();

setFog(color, 10, 140);
function animate(time) {
  time *= 0.001;
  dna_one.rotation.z = -time;
  dna_two.rotation.z = -time;
  dna_three.rotation.z = -time;

  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
