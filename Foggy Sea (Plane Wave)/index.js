import * as THREE from '../three.js-master/build/three.module.js';

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
let color = '#51D1BC';
renderer.setClearColor(color, 1);

let scene = new THREE.Scene();

function setFog(color, near, far) {
    scene.fog = new THREE.Fog(color, near, far);
}

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500000);
camera.position.z = 3000;
camera.position.y = 800;
camera.position.x = 10;
camera.rotation.x -= Math.PI * 0.1;

function addSphere(radius,opacity, isTransparent) {
    let geometry = new THREE.SphereGeometry(radius, 10, 10)
    let material = new THREE.MeshBasicMaterial({
        opacity: opacity ,
        transparent: isTransparent,
        color: '#fff'
    })
    console.log(material)
    let sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.z = -3000;
    sphere.position.y = 2000;
    return sphere;
}

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

function generatePlane(sizeX, sizeY, definitionX, definitionY) {
    let geometry = new THREE.PlaneGeometry(sizeX, sizeY, definitionX, definitionY);
    let material = new THREE.MeshBasicMaterial({color:'#111'});
    let mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x -= Math.PI * .5
    // material.wireframe = true;
    scene.add(mesh)
    return mesh;
}

let plainPoints = generatePlane(20000, 10000, 100, 100);

function randomizePlain() {
    for (let i = 0; i < plainPoints.geometry.vertices.length ; i++) {
        plainPoints.geometry.vertices[i].z += Math.random() * 1000 - Math.random()*1000;
        plainPoints.geometry.vertices[i].newZ = plainPoints.geometry.vertices[i].z;
        
    }
}

let count = 0;
function makeWave(vertex, i) {
    vertex.z = Math.cos(( i + count * 0.00001)) * (vertex.newZ - (vertex.newZ* 0.8));
    count += 0.5;
}

addSphere(200,0.7,true);
addSphere(220,0.2,true);

randomizePlain();

function animate(time) {
    time *= 0.001;

    checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

    for (let i = 0; i < plainPoints.geometry.vertices.length; i++) {
        makeWave(plainPoints.geometry.vertices[i], i)
    }

    plainPoints.geometry.verticesNeedUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

setFog(color, 0, 7000);

requestAnimationFrame(animate);