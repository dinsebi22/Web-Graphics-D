import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#canvas");

const renderer = new THREE.WebGLRenderer({ canvas });

let planet;
let water;

let paramsForWork = {
    noiseFactor: 5,
    noiseOffset: 0,
    detail: 3,
    smoothness: 2,
};


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

let color = "#eee";
renderer.setClearColor(color, 1);

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

let scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    500000
);

camera.position.z = 20;
var controls = new OrbitControls(camera, renderer.domElement);
controls.zoomSpeed = 1;
controls.maxDistance = 30;
controls.minDistance = 20;
controls.update();


function init() {
    let geometry = new THREE.IcosahedronBufferGeometry(10, 7);
    let geometry2 = new THREE.IcosahedronBufferGeometry(10.4, 5);

    var customUniforms = {
        time: { type: "f", value: 0.0 },
        noiseFactor: { type: "f", value: paramsForWork.noiseFactor },
        noiseOffset: { type: "f", value: paramsForWork.noiseOffset },
        detail: { type: "f", value: paramsForWork.detail },
        smoothness: { type: "f", value: paramsForWork.smoothness }
    };

    var waterUniforms = {
        time: { type: "f", value: 0.0 },
    };

    let material = new THREE.ShaderMaterial({
        // wireframe: true,
        uniforms: customUniforms,
        vertexShader: noiseGLSL + document.getElementById("vertexShader").textContent,
        fragmentShader: document.getElementById("fragmentShader").textContent,
    });

    let waterFragmentShader = `
    
        varying float displacement;

        void main(){
    
            vec3 color = vec3(0.0 ,0.0 ,0.0 );

            color.g = 0.4 + abs(displacement);
            color.b = 0.7 + abs(displacement);  

            gl_FragColor = vec4( color , 1.0 );
        }
    
    `
    let waterVertexShader = `
    
    float noise;
    uniform float time;
    varying float displacement;

    float  myNoise(vec3 pos){
        float t = -0.5;
        for(float f = 1.0; f < 10.0 ; f++){
            float power  = pow(2.0 , f);
            t += abs( snoise( vec3( power * pos ) ) / power );
        }
        return t;
    }

    void main(){

    noise = 40.0 * 0.01 * myNoise( normal + time /2.0 );
    float b = snoise( vec3(0.005 * position));
    displacement = 0.3 * noise + b  ;

    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    }

    `;

    let waterMaterial = new THREE.ShaderMaterial({
        // wireframe: true,
        glslVersion: "THREE.GLSL3",
        uniforms: waterUniforms,
        vertexShader: noiseGLSL + waterVertexShader,
        fragmentShader: waterFragmentShader,
    });

    // create a planet and assign the material
    planet = new THREE.Mesh(geometry, material);
    water = new THREE.Mesh(geometry2, waterMaterial);

    scene.add(planet);
    scene.add(water);

    render();
}


var gui = new dat.GUI();

gui.add(paramsForWork, "noiseFactor").min(0).max(10).step(0.5).listen();
gui.add(paramsForWork, "noiseOffset").min(0).max(100).step(1).listen();
gui.add(paramsForWork, "detail").min(0).max(10).step(0.5).listen();
gui.add(paramsForWork, "smoothness").min(1.5).max(15).step(0.0001).listen();

gui.close();


init();

function render(time) {
    time *= 0.0001;

    checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));


    planet.material.uniforms["time"].value = time;
    water.material.uniforms["time"].value = time;

    planet.material.uniforms["noiseFactor"].value = paramsForWork.noiseFactor;
    planet.material.uniforms["noiseOffset"].value = paramsForWork.noiseOffset;
    planet.material.uniforms["detail"].value = paramsForWork.detail;
    planet.material.uniforms["smoothness"].value = paramsForWork.smoothness;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}









//////////////////////////////////////////////////////////////
