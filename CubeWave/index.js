import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
const n = noise;

let scene = new THREE.Scene();
scene.background = new THREE.Color('black');

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50000);
camera.position.x = 35;
camera.position.y = 30;
camera.rotation.x -= Math.PI * 0.2


var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enablePan = true;
controls.minDistance = 10;
controls.maxDistance = 500;

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false)
    }
    return needResize
}


function checkResizeRendererDisplay(isRendererResize) {
    if (isRendererResize) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
}

function addLight() {
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
scene.add( directionalLight );
}



function generatePlane(countX , countY) {
    let size = 1;
    var geometry = new THREE.BoxBufferGeometry(size, size, size);

    for (let i = 0; i < countY; i++) {
        let row = [];
        for (let j = 0; j < countX; j++) {    
            var material = new THREE.MeshBasicMaterial();
            var cube = new THREE.Mesh(geometry, material);
            cube.position.x = i*size-countX/2*size;
            cube.position.z = j*size - countY/2*size;
            cube.position.y = -20
            row.push(cube);
            scene.add(cube);
        }
        plane.push(row)
    }
}
function setFog(color, near, far) {
    scene.fog = new THREE.Fog(color, near, far);
}

function giveColor(value , element){
    if(value < 17){
        element.r = 0
        element.g = 0
        element.b = value/20 % 255   
    }else if(value < 25){
        element.r = 0
        element.g = value/60 % 255
        element.b = 0
    
    }else if(value < 35){
        element.r = value/35 % 255
        element.g = value/35 % 255
        element.b = value/35 % 255
    }
}

// RAIN
// RAIN
// RAIN

function generateStars() {
    let count = 1000;
    var geometry = new THREE.BufferGeometry();
    let positions = new Float32Array(3 * count)
    let speedParam = new Float32Array( count)

    for (var i = 0; i < count; i++) {
        var dot = new THREE.Vector3();
        dot.x = THREE.Math.randFloatSpread(47);
        dot.y =50+ THREE.Math.randFloatSpread(70);
        dot.z = THREE.Math.randFloatSpread(47);
        dot.toArray(positions, i * 3)

        var speed = Math.random()/2
        speedParam[i] = speed
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speedParam, 1));

    let material = new THREE.PointsMaterial({
        size: 0.1
        // fog:false
    });
    let mesh = new THREE.Points(geometry, material);
    scene.add(mesh)
    return mesh;
}

let pointCloud = generateStars();
var positions = pointCloud.geometry.attributes.position.array;
var speeds = pointCloud.geometry.attributes.speed.array;

function rain() {

    for (let index = 0, i = 0; index < positions.length; index += 3, i++) {
        
        positions[index + 1] -= speeds[i];

        if(positions[index] > 47 ){
            positions[index] = THREE.Math.randFloatSpread(47);
        }

        if(positions[index+1] < -15 ){
            positions[index+1] = 70
        }

        if(positions[index+2] > 47 ){
            positions[index+2] = THREE.Math.randFloatSpread(47);
        }
    }
}

function animate(time) {
    time *= 0.0001;
    checkResizeRendererDisplay(resizeRendererToDisplaySize(renderer));

    for (let i = 0; i < plane.length; i++) {
        for (let j = 0; j < plane[i].length; j++) {
            plane[j][i].scale.y = 20 + n.perlin2(j*period + time, i*period + time) * 25
            giveColor(Math.floor(plane[j][i].scale.y) , plane[j][i].material.color)
        }
    }
    rain();
    controls.update();
    pointCloud.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

addLight();
setFog('black' , 0 , 100)
let plane = [];
generatePlane(50,50);


let centerPos = {
    x:plane.length/2,
    y:plane[0].length/2
}
var period = 1 / 15;

requestAnimationFrame(animate);