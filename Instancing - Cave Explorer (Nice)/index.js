import { FlyControls } from "https://threejs.org/examples/jsm/controls/FlyControls.js";
import { DeviceOrientationControls } from "https://threejs.org/examples/jsm/controls/DeviceOrientationControls.js";

const onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let isTouching = false;


const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
let color = "#000";
renderer.setClearColor(color, 1);
let scene = new THREE.Scene();

let controls;
let instancedMesh;

let paramsForWork = {
  detailHigh: 20,
  detailLow: 200,
};

var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  500000
);


let noiseGLSL =
  `

vec3 mod289(vec3 x) {
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


`;


let vertexShader = `

    uniform float time; 
    uniform float detailHigh; 
    uniform float detailLow; 
    uniform vec3 cameraPos; 

    attribute vec3 gridPosition;
    attribute vec3 centerOffset;

    varying vec3 aColor;
    varying vec3 finalPos;

    void main(){
      vec3 transformed = position;
      transformed += gridPosition;

      float noiseVal = snoise(gridPosition/detailLow + cameraPos / 10.0 + -3.0);
      float noiseDetailHighVal = snoise(gridPosition/detailHigh );

      float noise = noiseVal*100.0  + noiseDetailHighVal*10.0;
      float colorNoise = (abs(centerOffset.x)+abs(centerOffset.y)+abs(centerOffset.z))/60.0;
      
      aColor += 0.55 - colorNoise;

      
      vec4 modelViewPosition =  modelViewMatrix * (vec4(transformed, 1.0)*noise*10.0);

      gl_Position = projectionMatrix * modelViewPosition;
    }

`;

let fragmentShader = `
varying vec3 aColor;

  void main(){
    
    gl_FragColor = vec4(aColor , 1.0) * 2.0;
  }
`;


function init() {
  let size = 10;
  let baseGeometry = new THREE.BoxBufferGeometry(size, size, size);
  let instancedGeometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);

  let instanceCount = 46;
  instancedGeometry.instanceCount = Math.pow(instanceCount, 3);
  let centerOffset = 46 / 2;

  let gridPositions = [];
  let centerOffsets = [];

  for (let i = 0; i < instanceCount; i++) {
    for (let j = 0; j < instanceCount; j++) {
      for (let k = 0; k < instanceCount; k++) {
        gridPositions.push(i * size, j * size, k * size)
        centerOffsets.push(centerOffset - i, centerOffset - j, centerOffset - k)
      }
    }
  }

  let gridPositionsFloat32Array = new Float32Array(gridPositions)
  let centerOffsetsFloat32Array = new Float32Array(centerOffsets)

  instancedGeometry.setAttribute("gridPosition", new THREE.InstancedBufferAttribute(gridPositionsFloat32Array, 3, false));
  instancedGeometry.setAttribute("centerOffset", new THREE.InstancedBufferAttribute(centerOffsetsFloat32Array, 3, false));

  // Re-center mesh at origin
  instancedGeometry.translate(-instanceCount * size / 2, -instanceCount * size / 2, -instanceCount * size / 2)

  let customUniforms = {
    time: { type: "f", value: 0.0 },
    detailHigh: { type: "f", value: paramsForWork.detailHigh },
    detailLow: { type: "f", value: paramsForWork.detailLow },
    cameraPos: { type: "vec3", value: camera.position },
  }

  let material = new THREE.ShaderMaterial({
    // wireframe: true,
    uniforms: customUniforms,
    fragmentShader: fragmentShader,
    vertexShader: noiseGLSL + vertexShader
  })

  instancedMesh = new THREE.Mesh(instancedGeometry, material);
  instancedMesh.frustumCulled = false;

  scene.add(instancedMesh)
}


function gui() {
  var gui = new dat.GUI();

  gui.add(paramsForWork, "detailHigh").min(20).max(50).step(1).listen();
  gui.add(paramsForWork, "detailLow").min(100).max(1000).step(0.1).listen();

  gui.close();
}

const clock = new THREE.Clock();

function animate(time) {
  time *= 0.0001;
  const delta = clock.getDelta();

  instancedMesh.material.uniforms["time"].value = delta;
  instancedMesh.material.uniforms["detailHigh"].value = paramsForWork.detailHigh;
  instancedMesh.material.uniforms["detailLow"].value = paramsForWork.detailLow;
  instancedMesh.material.uniforms["cameraPos"].value = camera.position;

  instancedMesh.position.x = camera.position.x
  instancedMesh.position.z = camera.position.z;
  instancedMesh.position.y = camera.position.y;


  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));
  if (controls instanceof DeviceOrientationControls) {

    if (isTouching) {
      var direction = new THREE.Vector3(0, 0, 0);
      camera.getWorldDirection(direction);
      direction.normalize();
      direction.divideScalar(15)
      camera.position.add(direction);
    }

    controls.update();

  } else {
    controls.movementSpeed = 3;
    controls.update(delta)
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
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


doCheck();


function doCheck() {
  if (onMobile) {

    let container = document.createElement('div');
    container.id = 'overlay';
    let startButton = document.createElement('button');
    startButton.innerText = 'Start';
    startButton.id = "startButton";
    container.appendChild(startButton);
    document.body.appendChild(container);

    startButton.addEventListener('click', function () {

      const overlay = document.getElementById('overlay');
      overlay.remove();

      controls = new DeviceOrientationControls(camera);
      controls.connect();

      init();
      gui();

      canvas.addEventListener("touchstart", () => {
        isTouching = true;
      });



      canvas.addEventListener("touchend", () => {
        isTouching = false;

      });


      requestAnimationFrame(animate);
    }, false);

  } else {



    // false for not mobile device
    controls = new FlyControls(camera, renderer.domElement);

    controls.domElement = renderer.domElement;
    controls.rollSpeed = Math.PI / 5;
    controls.autoForward = false;
    controls.autoRotate = false;
    controls.dragToLook = false;
    controls.enablePan = false;


    controls.keys = {
      LEFT: 65, //left arrow
      UP: 87, // up arrow
      RIGHT: 39, // right arrow
      BOTTOM: 68 // down arrow
    }

    init();
    gui();
    requestAnimationFrame(animate);
  }
}


