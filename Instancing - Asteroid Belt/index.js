import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { BufferGeometryUtils } from "https://threejs.org/examples/jsm/utils/BufferGeometryUtils.js";

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
let color = "#111";
renderer.setClearColor(color, 1);
let scene = new THREE.Scene();

let instancedMesh;


let paramsForWork = {
  detail: 2,
  offsetFactor: 1,
  angleOffset: 1,
};


var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  500000
);

var controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 10000;
camera.position.y = 13500;
camera.position.x = -8000;


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
    uniform float detail;
    uniform float offsetFactor;
    uniform float angleOffset;

    attribute float randomSpeed;
    attribute vec3 randomColor;   
    attribute float offset;   
    attribute float scale;   

    varying vec3 aColor;
    
    void main(){
      vec3 transformed = position;
      
      transformed.z += sin( 100.0 * randomSpeed + time ) * (offset * offsetFactor) ;
      transformed.x += cos( 100.0 * randomSpeed + time ) * (offset * offsetFactor);
      transformed.y += sin( 100.0 * randomSpeed + time + scale/ detail ) * (offset * offsetFactor) * (angleOffset)  ;


      transformed *= scale;
      
      aColor = randomColor;
      
      vec4 modelViewPosition =  modelViewMatrix * vec4(transformed, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }

`;

let fragmentShader = `
  varying vec3 aColor;
  uniform float time;

  void main(){
    gl_FragColor = vec4(aColor , 1.0);
  }

`;

function initPlanet() {
  let planetGeom = new THREE.IcosahedronBufferGeometry(1500, 4);
  let material = new THREE.MeshStandardMaterial({ color: 'black' })
  let mesh = new THREE.Mesh(planetGeom, material);
  scene.add(mesh)
}



function addLight() {
  const pointLight = new THREE.PointLight('#ddd', 210, 5000);
  pointLight.position.set(3000, 3000, 3000);
  scene.add(pointLight);
  // Helper
  // const sphereSize = 100;
  // const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
  // scene.add(pointLightHelper);
}


function init() {
  let baseGeometry = new THREE.SphereBufferGeometry(5, 5, 5);
  let instancedGeometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);

  let instanceCount = 70000;
  instancedGeometry.instanceCount = instanceCount;

  let scales = [];
  let speeds = [];
  let colors = [];
  let offsets = [];

  let colorOptions = [
    new THREE.Color("#787276"),
    new THREE.Color("#48494B"),
    new THREE.Color("#B9BBB6"),
  ]

  for (let i = 0; i < instanceCount; i++) {

    speeds.push(10 + Math.random() * 2);

    let color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    colors.push(color.r, color.g, color.b);

    let val = 1.9 + Math.random() * 10;
    offsets.push(1000 + val + i / 1000);
    scales.push(val);

  }

  let scalesFloat32Array = new Float32Array(scales)
  let speedsFloat32Array = new Float32Array(speeds)
  let colorsFloat32Array = new Float32Array(colors)
  let offsetsFloat32Array = new Float32Array(offsets)

  instancedGeometry.setAttribute("scale", new THREE.InstancedBufferAttribute(scalesFloat32Array, 1, false));
  instancedGeometry.setAttribute("randomSpeed", new THREE.InstancedBufferAttribute(speedsFloat32Array, 1, false));
  instancedGeometry.setAttribute("randomColor", new THREE.InstancedBufferAttribute(colorsFloat32Array, 3, false));
  instancedGeometry.setAttribute("offset", new THREE.InstancedBufferAttribute(offsetsFloat32Array, 1, false));


  let customUniforms = {
    time: { type: "f", value: 0.0 },
    detail: { type: "f", value: paramsForWork.detail },
    offsetFactor: { type: "f", value: paramsForWork.offsetFactor },
    angleOffset: { type: "f", value: paramsForWork.offsetFactor },
  }

  let material = new THREE.ShaderMaterial({
    // wireframe: true,
    uniforms: customUniforms,
    fragmentShader: fragmentShader,
    vertexShader: noiseGLSL + vertexShader
  })

  instancedMesh = new THREE.Mesh(instancedGeometry, material);
  scene.add(instancedMesh)
}

function setFog(color, near, far) {
  scene.fog = new THREE.Fog(color, near, far);
}


var gui = new dat.GUI();

gui.add(paramsForWork, "detail").min(0.2).max(10).step(0.01).listen();
gui.add(paramsForWork, "offsetFactor").min(0.9).max(4).step(0.001).listen();
gui.add(paramsForWork, "angleOffset").min(0.01).max(1).step(0.001).listen();

gui.close();


function animate(time) {
  time *= 0.0001;
  instancedMesh.material.uniforms["time"].value = time;
  instancedMesh.material.uniforms["detail"].value = paramsForWork.detail;
  instancedMesh.material.uniforms["offsetFactor"].value = paramsForWork.offsetFactor;
  instancedMesh.material.uniforms["angleOffset"].value = paramsForWork.angleOffset;


  checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

initPlanet();
addLight()
init();

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