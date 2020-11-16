import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
const onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
let color = "#aa9268";
renderer.setClearColor(color, 1);
renderer.outputEncoding = THREE.sRGBEncoding;

let scene = new THREE.Scene();
const n = noise;

let camera, controls;
let sand;
let pyramidOne, pyramidTwo, pyramidThree;
let pointSizeFactor;
let floatyesArr = [];

function doCheck() {
  if (onMobile) {
    pointSizeFactor = 5;
  } else {
    pointSizeFactor = 5;
  }
}
doCheck();

function setFog(color, near, far) {
  scene.fog = new THREE.Fog(color, near, far);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    500000
  );
  camera.position.z = 310;
  camera.position.x = 100;
  camera.frustumCulled = false;
}

function initControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2;
  controls.dampingFactor = 0.005;
  controls.maxDistance = 400;
  controls.minDistance = 300;
  controls.maxPolarAngle = Math.PI / 1.95;
  controls.update();
}


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

function genPyramid(x, z, pyramidLight) {
  const material = new THREE.MeshStandardMaterial({ color: "#c59e5a" });

  const geometry1 = new THREE.ConeBufferGeometry(130, 130, 4);
  let pyramid = new THREE.Mesh(geometry1, material);
  pyramid.position.z = z;
  pyramid.position.x = x;

  let pyramidWithDetail = addDetail(pyramid, material);
  scene.add(pyramidWithDetail);

  const bulbGeometry = new THREE.OctahedronBufferGeometry(2, 0);
  const bulbMat = new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    fog: false,
    color: 0x000000
  });

  let lightMesh = new THREE.Mesh(bulbGeometry, bulbMat);
  pyramidLight = new THREE.PointLight(0xffee88, 7, 450, 10);
  lightMesh.scale.y = 2;
  pyramidLight.add(lightMesh);
  pyramidLight.position.set(pyramid.position.x, pyramid.position.y + 80, pyramid.position.z);
  scene.add(pyramidLight);

  return {
    pyramid: pyramid,
    light: pyramidLight
  }
}

function addDetail(pyramid, material) {
  let group = new THREE.Group();
  group.add(pyramid);

  let width = pyramid.geometry.parameters.radius - 5;
  for (let i = 0; i < 4; i++) {

    let cubeGeom = new THREE.BoxGeometry(10, 30, 10);
    let cube = new THREE.Mesh(cubeGeom, material);

    let icosaGeom = new THREE.IcosahedronBufferGeometry(5, 0);
    let floaty = new THREE.Mesh(icosaGeom, material);

    //Center The meshes around the object
    centerMeshes(cube, pyramid);
    centerMeshes(floaty, pyramid);
    cube.position.y -= 40;
    floaty.position.y -= 17;

    positionAround(cube, width, i);
    positionAround(floaty, width, i);

    floatyesArr.push(floaty);

    group.add(cube)
    group.add(floaty)
  }

  let gateGeom = new THREE.BoxGeometry(20, 60, 30)
  let gate = new THREE.Mesh(gateGeom, material);
  gate.rotateY(Math.PI / 4)
  gate.rotateX(Math.PI / 3.3)
  gate.position.y -= 50;
  // gate.position.y -= 30;
  centerMeshes(gate, pyramid);
  positionAround(gate, width / 2.7, 0.5);
  group.add(gate);

  return group;
}

function centerMeshes(m1, m2) {
  m1.position.x += m2.position.x;
  m1.position.y += m2.position.y;
  m1.position.z += m2.position.z;
}

function positionAround(mesh, radius, i) {
  mesh.position.x += radius * Math.cos(Math.PI / 2 * i)
  mesh.position.z += radius * Math.sin(Math.PI / 2 * i)
}

function moveLights(time) {
  pyramidOne.light.position.y += Math.sin(time) / 15;
  pyramidTwo.light.position.y += Math.sin(time) / 15;
  pyramidThree.light.position.y += Math.sin(time) / 15;
  pyramidOne.light.rotation.y = time;
  pyramidTwo.light.rotation.y = time;
  pyramidThree.light.rotation.y = time;

  floatyesArr.forEach(floaty => {
    floaty.rotation.y = time;
    floaty.rotation.y = time;
    floaty.rotation.y = time;
  });
}

let glslNoise = `vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
  return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
  dot(p2,x2), dot(p3,x3) ) );
  }

`
let glslCurlNoise = `vec3 snoiseVec3( vec3 x ){

  float s  = snoise(vec3( x ));
  float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
  float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
  vec3 c = vec3( s , s1 , s2 );
  return c;

}


vec3 curlNoise( vec3 p ){
  
  const float e = .1;
  vec3 dx = vec3( e   , 0.0 , 0.0 );
  vec3 dy = vec3( 0.0 , e   , 0.0 );
  vec3 dz = vec3( 0.0 , 0.0 , e   );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / ( 2.0 * e );
  return normalize( vec3( x , y , z ) * divisor );

}`

let sandVertexShader =
  `
  uniform float time;
  uniform float pointSizeFactor;
  varying float noise;
  varying vec3 cellPos;
  attribute float speed;
  
  void main(){

    cellPos = position;

    noise = snoise(position/500.0 + time / 5.0 );
    cellPos *= curlNoise(cellPos/ 700.0 + time/speed );
    
    gl_PointSize = noise*pointSizeFactor;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( cellPos, 1.0 );
  }
`
let sandFragmentShader = `
precision mediump float;

void
main()
{
    vec4 myColor = vec4(0.83 , 0.75, 0.55 ,1.0 );
    float r = 0.0, delta = 0.0, alpha = 1.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    if (r > 1.0) {
        discard;
    }
    gl_FragColor = myColor * (alpha);
  }
  
`

function generatePlane(sizeX, sizeY, definitionX, definitionY) {
  let geometry = new THREE.PlaneGeometry(
    sizeX,
    sizeY,
    definitionX,
    definitionY
  );
  let material = new THREE.MeshStandardMaterial({ color: "#EDC9AF" });
  let terrain = new THREE.Mesh(geometry, material);

  terrain.rotation.x -= Math.PI * 0.5;
  terrain.position.y -= 40;
  scene.add(terrain);
  return terrain;
}


function generateSand() {
  let count = 20000;
  var geometry = new THREE.BufferGeometry();
  let positions = new Float32Array(3 * count);
  let speeds = [];

  for (var i = 0; i < count; i++) {
    var dot = new THREE.Vector3();
    dot.x = THREE.Math.randFloatSpread(1000);
    dot.y = 20 + THREE.Math.randFloatSpread(300);
    dot.z = THREE.Math.randFloatSpread(1000);
    dot.toArray(positions, i * 3);

    let speed = 100 + Math.random() * 50;
    speeds.push(speed)
  }

  let speedsFloat32Array = new Float32Array(speeds)

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("speed", new THREE.BufferAttribute(speedsFloat32Array, 1));

  var customUniforms1 = {
    time: { type: "f", value: 0.0 },
    pointSizeFactor: { type: "f", value: pointSizeFactor }
  };

  let pointMaterial = new THREE.ShaderMaterial({
    uniforms: customUniforms1,
    vertexShader: glslNoise + glslCurlNoise + sandVertexShader,
    fragmentShader: sandFragmentShader,
  });
  sand = new THREE.Points(geometry, pointMaterial);
  scene.add(sand);
}


function makeWave(vertex,) {
  let xoff = vertex.x / 100;
  let yoff = vertex.y / 100;
  let rand = n.perlin2(yoff, xoff) * 30;
  vertex.z = rand;
}


function initWave() {
  for (let i = 0; i < plainPoints1.geometry.vertices.length; i++) {
    makeWave(plainPoints1.geometry.vertices[i], i);
  }
}

let plainPoints1 = generatePlane(2000, 2000, 300, 300);


function render(time) {
  time *= 0.001;
  sand.material.uniforms["time"].value = time;

  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

  moveLights(time);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}


pyramidOne = genPyramid(100, -150)
pyramidTwo = genPyramid(0, 100)
pyramidThree = genPyramid(-200, -50)

initCamera();
initControls();
generateSand();
initWave();

setFog(color, 0, 700);

requestAnimationFrame(render);
