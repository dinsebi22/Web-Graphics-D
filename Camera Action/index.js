import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

let video;
let size = 8;

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

camera.position.x = 25.5;
camera.position.y = 45;
camera.position.z = -40.5;
camera.rotation.x = -Math.PI / 2;
camera.rotation.z = Math.PI / 2;

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

function cubes(xCount, zCount) {
  let cubesArr = [];
  var material = new THREE.MeshNormalMaterial({});

  for (let i = 0; i < xCount; i++) {
    let row = [];
    for (let j = 0; j < zCount; j++) {
      var geometry = new THREE.BoxGeometry(0.95, 0.3, 0.95);
      var cube = new THREE.Mesh(geometry, material);
      cube.position.x = i;
      cube.position.y = 1.1;
      cube.position.z = -j;

      row.push(cube);
      scene.add(cube);
    }
    cubesArr.push(row);
  }
  return cubesArr;
}

let cubesArr;

function initCamera() {
  cubesArr = cubes(50, 80);
  setupWebCamera().then(() => {
    // We need to call these after
    // the web cam is setup so we
    // know the width and height
    // of the video feed
    reset();
    requestAnimationFrame(animate);
  });
}

function reset() {
  videoCanvas.width = video.videoWidth;
  videoCanvas.height = video.videoHeight;
}

function setupWebCamera() {
  return new Promise((resolve, reject) => {
    let constraints = { audio: false, video: true };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => {
        video = document.getElementById("videoInput");
        video.srcObject = mediaStream;
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      })
      .catch((err) => {
        console.log(err.name + ": " + err.message);
        reject(err);
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
      // cubesArr[i][j].scale.z = z * 10;
      cubesArr[i][j].rotation.z = z / 10;
    }
  }
}

function getAverage(pixels, x0, y0, w) {
  let r = 0;
  let g = 0;
  let b = 0;

  for (let x = x0; x < x0 + size; x += 1) {
    for (let y = y0; y < y0 + size; y += 1) {
      let index = (x + w * y) * 4;
      r += pixels[index];
      g += pixels[index + 1];
      b += pixels[index + 2];
    }
  }
  let val = (0.2126 * r + 0.7152 * g + 0.0722 + b) / (size * size);
  return isNaN(val) ? 1 : val;
}

function animate(time) {
  time *= 0.001;
  requestAnimationFrame(animate);

  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));
  ctx2.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

  pixelate();
  renderer.render(scene, camera);
}

initCamera();
