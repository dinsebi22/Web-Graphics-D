import { MapControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "https://threejs.org/examples/jsm/controls/DragControls.js";

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
let color = "rgb(0,0,105)";
renderer.setClearColor(color, 1);
let scene = new THREE.Scene();

let instancedMesh;
let countOffset;

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

let controls = new MapControls(camera, renderer.domElement);

//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;

controls.screenSpacePanning = false;

controls.maxDistance = 100;

controls.maxPolarAngle = Math.PI / 2.2;
controls.minPolarAngle = Math.PI / 4;
controls.maxAzimuthAngle = Math.PI / 5;
controls.minAzimuthAngle = -Math.PI / 5;

controls.keys = {
  LEFT: 65, //left arrow
  UP: 87, // up arrow
  RIGHT: 39, // right arrow
  BOTTOM: 68 // down arrow
}
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
    varying vec3 aColor;
    varying vec3 finalPos;

    void main(){
      vec3 transformed = position;
      transformed += gridPosition;

      float noiseVal = snoise(gridPosition/detailLow - cameraPos.z / 500.0 + cameraPos.x / 500.0 + time/5.0);
      float noiseDetailHighVal = snoise(gridPosition/detailHigh);

      float noise = noiseVal*100.0  + noiseDetailHighVal*10.0;
      if(noise < 1.0){
        transformed.y *= abs( noise*2.0 );

        transformed.y -= abs( noise );
      }else{
        transformed.y *= -abs( noise );
      }
      // transformed += camera
      aColor += 0.3+ abs(noiseVal + noiseDetailHighVal)/2.0;

      finalPos = transformed;
      
      vec4 modelViewPosition =  modelViewMatrix * vec4(transformed, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }

`;

let fragmentShader = `
varying vec3 aColor;
uniform float time; 
varying vec3 finalPos;


  void main(){
    
  if(finalPos.y > 1.0){
    gl_FragColor = vec4(0.0,aColor.y,0.0 , 1.0);
  }else{
    gl_FragColor = vec4(0.0,0.0, aColor.y , 1.0);

  }

  }

`;


function init() {
  let baseGeometry = new THREE.ConeBufferGeometry(1, 1, 4);
  let instancedGeometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);

  let instanceCount = 102400;
  instancedGeometry.instanceCount = instanceCount;

  let sqrtCount = Math.sqrt(instanceCount)
  countOffset = sqrtCount;
  // Update Camera position and controlls
  controls.target = new THREE.Vector3(sqrtCount, 0, sqrtCount);
  controls.maxDistance = sqrtCount / 2;
  camera.position.x = sqrtCount;
  camera.position.y = 1000;
  camera.position.z = sqrtCount * 1.5;


  let gridPositions = [];

  for (let i = 0; i < sqrtCount; i++) {
    for (let j = 0; j < sqrtCount; j++) {
      gridPositions.push(i + i * 1 + 0.2, 0, j + 1 * j + 0.2)

    }
  }

  let gridPositionsFloat32Array = new Float32Array(gridPositions)

  instancedGeometry.setAttribute("gridPosition", new THREE.InstancedBufferAttribute(gridPositionsFloat32Array, 3, false));

  console.log(camera);

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


function animate(time) {
  time *= 0.0001;

  instancedMesh.material.uniforms["time"].value = time;
  instancedMesh.material.uniforms["detailHigh"].value = paramsForWork.detailHigh;
  instancedMesh.material.uniforms["detailLow"].value = paramsForWork.detailLow;
  instancedMesh.material.uniforms["cameraPos"].value = camera.position;

  instancedMesh.position.x = camera.position.x - countOffset;
  instancedMesh.position.z = camera.position.z - countOffset * 1.9;

  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

init();
gui();
console.log(instancedMesh);
requestAnimationFrame(animate);

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