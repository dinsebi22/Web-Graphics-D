import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
const n = noise;

let scene = new THREE.Scene();
scene.background = new THREE.Color('black');

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50000);


var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enablePan = true;
controls.minDistance = 10;
controls.maxDistance = 5000;

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

function generateStars() {
    let count = 10000;
    var geometry = new THREE.BufferGeometry();
    let positions = new Float32Array(3 * count)
    let speedParam = new Float32Array(count)

    for (var i = 0; i < count; i++) {
        var dot = new THREE.Vector3();
        dot.x = THREE.Math.randFloatSpread(100);
        dot.y = THREE.Math.randFloatSpread(100);
        dot.z = THREE.Math.randFloatSpread(100);
        dot.toArray(positions, i * 3)

        var speed = Math.random() / 2
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

function flow() {

    for (let index = 0, i = 0; index < positions.length; index += 3, i++) {

        positions[index + 1] -= speeds[i];

        if (positions[index] > 47) {
            positions[index] = THREE.Math.randFloatSpread(47);
        }

        if (positions[index + 1] < -15) {
            positions[index + 1] = 70
        }

        if (positions[index + 2] > 47) {
            positions[index + 2] = THREE.Math.randFloatSpread(47);
        }
    }
}

function animate(time) {
    time *= 0.0000001;
    checkResizeRendererDisplay(resizeRendererToDisplaySize(renderer));

    for (let i = 0; i < positions.length; i += 3) {
        positions[i] = n.simplex3(positions[i]  / period +positions[i]/100+ time / 1000000,positions[i+1] / period + time / 1000000, time) * 20;
        positions[i + 1] += n.simplex3(positions[i+1] / period + time / 1000000,positions[i+1] / period + time / 1000000, time) * 20;
        positions[i + 2] = n.simplex3(positions[i+2] / period + time / 1000000, positions[i] / period + time / 1000000, time) * 20;
    }
    // rain();
    controls.update();
    pointCloud.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}



var period = 20;

requestAnimationFrame(animate);