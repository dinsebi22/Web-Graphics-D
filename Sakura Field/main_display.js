import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/OrbitControls.js";
//Based on:
//https://aerotwist.com/tutorials/creating-particles-with-three-js/
//http://petewerner.blogspot.co.uk/2015/02/intro-to-curl-noise.html

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
var scene = new THREE.Scene();
scene.background = new THREE.Color("white");

function resizeRendererToDisplaySize() {
  const resizeCanvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const windowWidth = (resizeCanvas.clientWidth * pixelRatio) | 0;
  const windowHeight = (resizeCanvas.clientHeight * pixelRatio) | 0;
  const needResize =
    resizeCanvas.width !== windowWidth || resizeCanvas.height !== height;
  if (needResize) {
    renderer.setSize(windowWidth, windowHeight, false);
  }
  return needResize;
}

function checkResizeRendererDisplay(isRendererResize) {
  if (isRendererResize) {
    const resizeCanvas = renderer.domElement;
    camera.aspect = resizeCanvas.clientWidth / resizeCanvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

//Spatial variables
var width = 10000;
var height = 10000;
var depth = 10000;

var particleCount = 5000;

var speed = 2;
//Noise field zoom
var step = 5000;
//Offset to counteract noise flattening when sampling on three planes
var offset = 0.0;

var w = canvas.clientWidth;
var h = canvas.clientHeight;
var ratio = w / h;

//Initialise Camera.js

var camera = new THREE.PerspectiveCamera(75, ratio, 1, 50033);
camera.position.z = 7000;
scene.add(camera);

//Particles
var particles = [];
var velocities = [];
var geometry = new THREE.BufferGeometry();
//Initial ember colour

//Add texture to particles
var loader = new THREE.TextureLoader();

var texture = loader.load(
  "https://img.icons8.com/external-vitaliy-gorbachev-flat-vitaly-gorbachev/58/000000/external-sakura-flowers-vitaliy-gorbachev-flat-vitaly-gorbachev.png"
);

//Variable size for particle material
var size = 100;

var material = new THREE.PointsMaterial({
  size: size,
  //   transparent: true,
  opacity: 1.0,
  map: texture,
  //Other particles show through transparent sections of texture
  depthTest: true,
  depthWrite: true,
  alphaTest: 0.5,
  //For glow effect
  blending: THREE.CustomBlending,
});

//Generate random particles
for (let i = 0; i < particleCount; i++) {
  let x = width / 2 - Math.random() * width;
  let y = height / 2 - Math.random() * height;
  let z = depth / 2 - Math.random() * depth;
  let vel_x = 0.5 - Math.random();
  let vel_y = 0.5 - Math.random();
  let vel_z = 0.5 - Math.random();

  particles.push(x, y, z);
  velocities.push(vel_x, vel_y, vel_z);
}

geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(particles, 3)
);

const points = new THREE.Points(geometry, material);

scene.add(points);

function fbm(x, y, z) {
  let n = 0;
  let l = 1.0;
  let totalWeight = 0.0;
  let amplitude = 1.0;
  for (let i = 0; i < 1; i++) {
    n += amplitude * noise.simplex3(x * l, y * l, z * l);
    totalWeight += amplitude;
    amplitude *= 0.5;
    l *= 2.0;
  }
  n /= totalWeight;
  return n;
}

//Find the curl of the noise field based on on the noise value at the location of a particle
function computeCurl(x, y, z) {
  var eps = 0.0001;

  x += 1000.0 * offset;
  y -= 1000.0 * offset;

  var curl = new THREE.Vector3();

  //Find rate of change in YZ plane
  var n1 = fbm(x, y + eps, z);
  var n2 = fbm(x, y - eps, z);
  //Average to find approximate derivative
  var a = (n1 - n2) / (2 * eps);
  var n1 = fbm(x, y, z + eps);
  var n2 = fbm(x, y, z - eps);
  //Average to find approximate derivative
  var b = (n1 - n2) / (2 * eps);
  curl.x = a - b;

  //Find rate of change in ZX plane
  n1 = fbm(x, y, z + eps);
  n2 = fbm(x, y, z - eps);
  //Average to find approximate derivative
  a = (n1 - n2) / (2 * eps);
  n1 = fbm(x + eps, y, z);
  n2 = fbm(x - eps, y, z);
  //Average to find approximate derivative
  b = (n1 - n2) / (2 * eps);
  curl.y = a - b;

  //Find rate of change in XY plane
  n1 = noise.simplex3(x + eps, y, z);
  n2 = noise.simplex3(x - eps, y, z);
  //Average to find approximate derivative
  a = (n1 - n2) / (2 * eps);
  n1 = noise.simplex3(x, y + eps, z);
  n2 = noise.simplex3(x, y - eps, z);
  //Average to find approximate derivative
  b = (n1 - n2) / (2 * eps);
  curl.z = a - b;

  return curl;
}

//----------MOVE----------//
function move(time) {
  for (let i = 0; i < particleCount * 3.0; i += 3) {
    //Find curl value at partile location
    var curl = computeCurl(
      particles[i] / step,
      particles[i + 1] / step,
      particles[i + 2] / step
    );

    //Update particle velocity according to curl value and speed
    velocities[i] = speed * curl.x;
    velocities[i + 1] = speed * curl.y;
    velocities[i + 2] = speed * curl.z;

    //Update particle position based on velocity
    particles[i] += velocities[i];
    particles[i + 1] += velocities[i + 1];
    particles[i + 2] += velocities[i + 2];

    //Boudnary conditions
    //If a particle gets too far away from (0,0,0), reset it to a random location
    var dist = Math.sqrt(
      particles[i] * particles[i] +
        particles[i + 1] * particles[i + 1] +
        particles[i + 2] * particles[i + 2]
    );
    if (dist > 5.0 * width) {
      particles[i] = width / 2 - Math.random() * width;
      particles[i + 1] = height / 2 - Math.random() * height;
      particles[i + 2] = depth / 2 - Math.random() * depth;
    }
  }

  geometry.getAttribute("position").copyArray(particles);
  geometry.getAttribute("position").needsUpdate = true;
}
//----------DRAW----------//
function animate(time) {
  time *= 0.001;
  checkResizeRendererDisplay(resizeRendererToDisplaySize(renderer));

  move(time);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
