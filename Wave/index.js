import * as THREE from '../three.js-master/build/three.module.js';

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas });


function setUpCamera(cells) {
    const fieldOfView = 120;
    const aspect = 2; // canvas default : 300/150  ->   width/height
    const near = 0.1;
    const far = 2000;
    const camera = new THREE.PerspectiveCamera(fieldOfView, aspect, near, far);
    camera.position.z = Math.sqrt(cells)/2;
    camera.position.x = cells/10/2
    camera.position.y = Math.sqrt(cells)/2;
    // camera.rotation.x = Math.sqrt(cells)/2;
    return camera;
}

const scene = new THREE.Scene();

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

let circleGrid = [];

function addCircle(circlesX , circlesY , separation) {
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff })
    var geometry = new THREE.IcosahedronBufferGeometry();
    
    for (let i = 0; i < circlesY; i++) {
        let circleRow = [];
        for (let j = 0; j < circlesX; j++) {

            var circle = new THREE.Mesh(geometry, material);
            circle.position.x = i * separation;
            circle.position.z = -j * separation;
            circleRow.push(circle)
            scene.add(circle);
        }
        circleGrid.push(circleRow);
    }
}

function movement( i ,j ,gridSize ,cell,time) {
    cell.position.y = ( Math.sin( ( i + gridSize +time) * 0.3 ) * 15 ) +
    ( Math.sin( ( j + gridSize +time) * 0.3 ) * 15 );
}

addCircle(100, 100, 10);
let camera = setUpCamera(circleGrid.length*circleGrid[0].length)

function animate(time) {
    // Converting 1000 ms to seconds
    time *= 0.01;

    checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer))

    for (let i = 0; i < circleGrid.length; i++) {
        for (let j = 0; j < circleGrid[i].length; j++) {
            movement(i,j,circleGrid.length,circleGrid[i][j],time)
        }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
