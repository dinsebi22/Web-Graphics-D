import * as THREE from '../three.js-master/build/three.module.js';

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();

function setUpCamera() {
    const fieldOfView = 120;
    const aspect = 2; // canvas default : 300/150  ->   width/height
    const near = 0.1;
    const far = 2000;
    const camera = new THREE.PerspectiveCamera(fieldOfView, aspect, near, far);
    camera.position.z = 20;
    return camera;
}

let camera = setUpCamera();

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
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

function GenerateBlob() {
    let geometry = new THREE.IcosahedronGeometry(1,6)
    var material = new THREE.MeshNormalMaterial();
    let mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh;
}

let blob = GenerateBlob();

function moveBlob(vertex, time, factor) {
    vertex.normalize().multiplyScalar(15 + 3 * noise.perlin3(vertex.x * factor + time*2, vertex.y * factor, vertex.z * factor));
}


function animate(time) {
    // Converting 1000 ms to seconds
    time *= 0.001;

    checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer))

    for (let i = 0; i < blob.geometry.vertices.length; i++) {
        moveBlob(blob.geometry.vertices[i], time, 3)
    }

    blob.geometry.computeVertexNormals();
    blob.geometry.normalsNeedUpdate = true;
    blob.geometry.verticesNeedUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
