import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/OrbitControls.js";
const n = noise;

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });

let scene = new THREE.Scene();
let enviromentColor = "#fff";
scene.background = new THREE.Color(enviromentColor);

let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  50000
);
camera.position.x = 505;
camera.position.y = 1110;
camera.position.z = 2510;
camera.rotation.x -= Math.PI * 0.2;

var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enablePan = false;
controls.minDistance = 6000;
controls.maxDistance = 7000;
controls.maxPolarAngle = Math.PI / 2.1;

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

function buildingTexture() {
  var canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 64;
  var context = canvas.getContext("2d");

  context.fillStyle = "#444";
  context.fillRect(0, 0, 32, 64);

  for (var y = 2; y < 64; y += 2) {
    for (var x = 0; x < 32; x += 2) {
      var value = Math.floor(Math.random() * 64);
      if (Math.random() * 32 > 15) {
        value = 255;
      }
      context.fillStyle = "rgb(" + [value, value, value].join(",") + ")";
      context.fillRect(x, y, 2, 1);
    }
  }

  var canvas2 = document.createElement("canvas");
  canvas2.width = 512;
  canvas2.height = 1024;
  var context2 = canvas2.getContext("2d");
  context2.imageSmoothingEnabled = false;
  context2.webkitImageSmoothingEnabled = false;
  context2.mozImageSmoothingEnabled = false;
  context2.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);

  return canvas2;
}

function generateCity(countX, countY) {
  let size = 400;
  let width = 100;
  let depth = 100;
  var geometry = new THREE.BoxGeometry(width, 3, depth);
  geometry.faces.splice(6, 2);
  geometry.faceVertexUvs[0].splice(6, 2);

  geometry.faceVertexUvs[0][4][0].set(0, 0);
  geometry.faceVertexUvs[0][4][1].set(0, 0);
  geometry.faceVertexUvs[0][4][2].set(0, 0);
  geometry.faceVertexUvs[0][5][0].set(0, 0);
  geometry.faceVertexUvs[0][5][1].set(0, 0);
  geometry.faceVertexUvs[0][5][2].set(0, 0);

  var texture = new THREE.Texture(buildingTexture());
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;

  var material = new THREE.MeshBasicMaterial({
    color: "#555",
    map: texture,
    vertexColors: THREE.VertexColors,
  });

  for (let i = 0; i < countY; i++) {
    let row = [];
    for (let j = 0; j < countX; j++) {
      let factor = Math.pow(
        30 + n.simplex2(i / 3, j / 3) * 500 + n.simplex2(i / 10, j / 10) * 140,
        1.009
      );

      if (Math.floor(factor) <= 20) {
        createTree(
          i * size - (countX / 2) * size + 20 * Math.random(),
          j * size - (countY / 2) * size + 20 * Math.random()
        );

        continue;
      } else {
        var cube = new THREE.Mesh(geometry, material);
        cube.position.x = i * size - (countX / 2) * size + 20 * Math.random();
        cube.position.z = j * size - (countY / 2) * size + 20 * Math.random();

        cube.scale.y = factor;
        cube.position.y += (cube.scale.y * cube.geometry.parameters.height) / 2;

        cube.scale.x = 1 + Math.random() * 2.5;
        cube.scale.z = 1 + Math.random() * 2.5;

        row.push(cube);
        scene.add(cube);
      }
    }
    plane.push(row);
  }
}

function createTree(x, z) {
  let geometry = new THREE.BoxGeometry(1, 1, 1);

  var leaveDarkMaterial = new THREE.MeshLambertMaterial({});

  var stem = new THREE.Mesh(geometry, leaveDarkMaterial);
  stem.position.set(0, 0, 0);
  stem.scale.set(0.3, 1.5, 0.3);

  var squareLeave01 = new THREE.Mesh(geometry, leaveDarkMaterial);
  squareLeave01.position.set(0.5, 1.6, 0.5);
  squareLeave01.scale.set(0.8, 0.8, 0.8);

  var squareLeave02 = new THREE.Mesh(geometry, leaveDarkMaterial);
  squareLeave02.position.set(-0.4, 1.3, -0.4);
  squareLeave02.scale.set(0.7, 0.7, 0.7);

  var squareLeave03 = new THREE.Mesh(geometry, leaveDarkMaterial);
  squareLeave03.position.set(0.4, 1.7, -0.5);
  squareLeave03.scale.set(0.7, 0.7, 0.7);

  var leaveDark = new THREE.Mesh(geometry, leaveDarkMaterial);
  leaveDark.position.set(0, 1.2, 0);
  leaveDark.scale.set(1, 2, 1);

  var leaveLight = new THREE.Mesh(geometry, leaveDarkMaterial);
  leaveLight.position.set(0, 1.2, 0);
  leaveLight.scale.set(1.1, 0.5, 1.1);

  let tree = new THREE.Group();
  tree.add(leaveDark);
  tree.add(leaveLight);
  tree.add(squareLeave01);
  tree.add(squareLeave02);
  tree.add(squareLeave03);
  tree.add(stem);

  scene.add(tree);

  tree.position.x = x;
  tree.position.z = z;
  tree.position.y += 60;

  tree.scale.x = 100;
  tree.scale.y = 100;
  tree.scale.z = 100;
}

function addPlane() {
  var geometry = new THREE.PlaneGeometry(20700, 20700, 2, 2);

  var material = new THREE.MeshBasicMaterial({
    color: "#111",
    side: THREE.DoubleSide,
  });

  var plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI / 2;
  plane.position.y = 2;
  scene.add(plane);
}

function setFog(color, near, far) {
  scene.fog = new THREE.Fog(color, near, far);
}

function animate(time) {
  time *= 0.0001;
  checkResizeRendererDisplay(resizeRendererToDisplaySize(renderer));

  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

let plane = [];
generateCity(50, 50);
addPlane();
setFog(enviromentColor, 0, 10000);

requestAnimationFrame(animate);
