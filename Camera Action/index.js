import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

let video;
let size = 8;
let cubeCountX;
let cubeCountY;

let videoCanvas = document.createElement("canvas");
let ctx2 = videoCanvas.getContext("2d");
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

let color = "white";
renderer.setClearColor(color, 1);

let scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  500000
);
var controls = new OrbitControls(camera, renderer.domElement);

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

function cubes(cubeCountY, cubeCountX) {
  let cubesArr = [];
  var material = new THREE.MeshNormalMaterial({});
  var group = new THREE.Group();

  for (let i = 0; i < cubeCountY; i++) {
    let row = [];
    for (let j = 0; j < cubeCountX; j++) {
      var geometry = new THREE.BoxGeometry(0.99, 0.3, 0.99);
      var cube = new THREE.Mesh(geometry, material);
      cube.position.x = i;
      cube.position.z = -j;
      row.push(cube);
      group.add(cube);
    }
    cubesArr.push(row);
  }
  group.rotation.z = -Math.PI / 2;
  group.rotation.y = -Math.PI / 2;
  scene.add(group);
  return cubesArr;
}

let cubesArr;

function initCamera() {
  getWebCamera().then(() => {
    setCameraSize();
    requestAnimationFrame(animate);
  });
}

function setCameraSize() {
  videoCanvas.width = video.videoWidth;
  videoCanvas.height = video.videoHeight;
  cubeCountX = video.videoWidth / size;
  cubeCountY = video.videoHeight / size - 1;
  cubesArr = cubes(cubeCountY, cubeCountX);
  camera.position.z = cubeCountX / 1.3;
  camera.position.y = -cubeCountY / 2;
  camera.position.x = cubeCountX / 2;
  controls.target.set(cubeCountX / 2, -cubeCountY / 2, 0);
}

function getWebCamera() {
  return new Promise((resolve) => {
    let constraints = { audio: false, video: true };
    navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
      video = document.getElementById("videoInput");
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });
  });
}

function pixelate() {
  let w = video.videoWidth;
  let h = video.videoHeight;

  let imageData = ctx2.getImageData(0, 0, w, h);
  let pixels = imageData.data;

  for (let i = 0; i < cubesArr.length; i++) {
    for (let j = 0; j < cubesArr[i].length; j++) {
      let x = cubesArr[i][j].position.x;
      let y = cubesArr[i][j].position.z;
      let col = getAverage(pixels, w - y * size, x * size, w);
      let z = col / 10 + 0.1;
      cubesArr[i][j].rotation.z = z / 15;
    }
  }
}

function getAverage(pixels, squareOfPixelsX, squareOfPixelsY, w) {
  let red = 0;
  let green = 0;
  let blue = 0;

  for (let x = squareOfPixelsX; x < squareOfPixelsX + size; x += 1) {
    for (let y = squareOfPixelsY; y < squareOfPixelsY + size; y += 1) {
      let pixelIndex = (x + w * y) * 4;
      red += pixels[pixelIndex];
      green += pixels[pixelIndex + 1];
      blue += pixels[pixelIndex + 2];
    }
  }
  let val = (0.2126 * red + 0.7152 * green + 0.0722 + blue) / (size * size);
  if (val === NaN) {
    return 1;
  }
  return val;
}

function animate(time) {
  time *= 0.001;
  requestAnimationFrame(animate);

  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));
  ctx2.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

  controls.update();
  pixelate();
  renderer.render(scene, camera);
}

initCamera();
