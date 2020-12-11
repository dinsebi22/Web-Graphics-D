import "https://cdnjs.cloudflare.com/ajax/libs/three.js/r120/three.min.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

let canvas;
let renderer;
let scene;
let camera;
let controls;
const n = noise;
let mainGroup = new THREE.Group();

function initCanvas() {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas)
}
function init() {
    initCanvas()
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setClearColor('rgb(185, 207, 247)')
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.z = 13;
    camera.position.y = 3;

    addControls();
}
function addControls() {
    controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 15;
}
function addLight() {
    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
    light.position.set(0, -50, 0);
    scene.add(light);
}
function addPointLight() {
    const pointLight = new THREE.PointLight('white', 1, 20);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

}

function makePlane() {

    const geometry = new THREE.PlaneGeometry(10, 10, 20, 20);
    const material = new THREE.MeshStandardMaterial({
        color: 'rgb(107, 255, 255)',
        side: THREE.BackSide,
        flatShading: THREE.FlatShading,
    });


    let index = 0;
    for (let i = 0; i < 21; i++) {
        for (let j = 0; j < 21; j++) {

            geometry.vertices[index].z = -
                (1.5 / Math.sqrt(
                    (i - 10) * (i - 10) + (j - 10) * (j - 10) + 5
                ) * 10) + n.perlin2(j / 2, i / 2)

            if (geometry.vertices[index].z > -2) {
                geometry.vertices[index].z = 0;
            }
            index += 1;

        }
    }

    const borderMaterial = new THREE.MeshStandardMaterial({
        color: 'rgb(80, 54, 54)',
        flatShading: THREE.FlatShading
    });
    const borderGeometry = new THREE.BoxBufferGeometry(10, 1, 0.2);

    const left = new THREE.Mesh(borderGeometry, borderMaterial);
    const right = new THREE.Mesh(borderGeometry, borderMaterial);
    const back = new THREE.Mesh(borderGeometry, borderMaterial);
    const front = new THREE.Mesh(borderGeometry, borderMaterial);

    left.position.x -= 5;
    right.position.x += 5;
    front.position.z += 5;
    back.position.z -= 5;
    left.position.y += 0.35;
    right.position.y += 0.35;
    front.position.y += 0.35;
    back.position.y += 0.35;

    right.rotation.y -= Math.PI / 2
    left.rotation.y -= Math.PI / 2

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x -= Math.PI / 2

    const group = new THREE.Group();
    group.add(left);
    group.add(right);
    group.add(front);
    group.add(back);
    group.add(plane);

    const actualPlaneGeometry = new THREE.PlaneGeometry(10, 10, 30, 30);
    const actualPlaneMaterial = new THREE.MeshStandardMaterial({
        color: '#bbe9ff',
        side: THREE.FrontSide,
        flatShading: THREE.FlatShading,
    });

    index = 0;
    for (let i = 0; i < 31; i++) {
        for (let j = 0; j < 31; j++) {

            actualPlaneGeometry.vertices[index].z = n.perlin2(j / 10, i / 10)
            index += 1;

        }
    }

    const actualPlane = new THREE.Mesh(actualPlaneGeometry, actualPlaneMaterial);
    actualPlane.position.y += 0.5
    actualPlane.rotation.x -= Math.PI / 2

    group.add(actualPlane);
    group.position.y -= 2

    mainGroup.add(group)

}

function addHouse() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
        color: 'white',
        flatShading: THREE.FlatShading,
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 'rgb(70, 40, 40)',
        flatShading: THREE.FlatShading
    });
    const roofGeometry1 = new THREE.BoxBufferGeometry(2.6, 0.2, 6);
    const roofLeft = new THREE.Mesh(roofGeometry1, roofMaterial);
    roofLeft.rotation.z = Math.PI / 8
    roofLeft.position.y = 1.95
    roofLeft.position.x = -0.7
    group.add(roofLeft);

    const roofGeometry2 = new THREE.BoxBufferGeometry(2.5, 0.2, 6);
    const roofRight = new THREE.Mesh(roofGeometry2, roofMaterial);
    roofRight.rotation.z = -Math.PI / 4
    roofRight.position.y = 1.9
    roofRight.position.x = 1
    group.add(roofRight);

    const wallGeomMaterial = new THREE.MeshStandardMaterial({
        color: 'rgb(100, 54, 54)',
        flatShading: THREE.FlatShading
    })
    for (let i = 0; i < 2; i++) {

        const wallGeom = new THREE.BoxBufferGeometry(1.5, 2.8, 0.2);
        const wall = new THREE.Mesh(wallGeom, wallGeomMaterial);
        wall.rotation.z = -Math.PI / 2.7
        wall.rotation.x = -Math.PI / 20 + Math.PI / 20 * i * 1.5
        wall.position.z = -2.43 + (i * 4.85)
        wall.position.y = 1.5

        group.add(wall);
    }


    const delimiterGeom = new THREE.BoxBufferGeometry(3.2, 0.2, 5.4);
    const delimiterMaterial = new THREE.MeshStandardMaterial({
        color: 'rgb(120, 54, 54)',
        flatShading: THREE.FlatShading
    })
    const delimiter = new THREE.Mesh(delimiterGeom, delimiterMaterial);
    delimiter.position.y = 1.3;
    delimiter.rotation.z -= Math.PI / 50;

    const houseGeom = new THREE.BoxBufferGeometry(3, 3, 5);
    const houseMaterial = new THREE.MeshStandardMaterial({
        color: '#746442',
        flatShading: THREE.FlatShading
    })
    const house = new THREE.Mesh(houseGeom, houseMaterial);
    house.receiveShadow = true;

    group.add(house);
    group.add(roofLeft);
    group.add(roofRight);
    group.add(delimiter)


    const doorGeom = new THREE.BoxBufferGeometry(1.2, 2, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: '#c2b7a0',
        flatShading: THREE.FlatShading
    })
    const door = new THREE.Mesh(doorGeom, doorMaterial);
    door.position.z = 2.5;
    door.position.y = -0.6;

    const doorKnobgGeometry = new THREE.SphereGeometry(0.05, 6, 6);
    const doorNob = new THREE.Mesh(doorKnobgGeometry, material)
    doorNob.position.z = 2.6;
    doorNob.position.y -= 0.6;
    doorNob.position.x = 0.4;

    const ringGeom = new THREE.TorusGeometry(0.08, 0.01, 4, 8);
    const ring = new THREE.Mesh(ringGeom, material);
    ring.position.z = 2.63;
    ring.position.y -= 0.67;
    ring.position.x = 0.4;

    group.add(ring)
    group.add(door)
    group.add(doorNob)


    const chimnyGeom = new THREE.TorusGeometry(0.3, 0.1, 4, 4);
    const chimny = new THREE.Mesh(chimnyGeom, roofMaterial);
    chimny.rotation.x -= Math.PI / 2;
    chimny.scale.z = 8;
    chimny.position.z = -1.5;
    chimny.position.y = 2.2;
    chimny.position.x = -0.8;
    group.add(chimny)

    group.rotation.y -= Math.PI / 4;
    group.position.x = 2;
    group.position.z = -2;

    mainGroup.add(group);
    addWindows();
}

function addSnowman() {

    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
        color: 'white',
        side: THREE.FrontSide,
        flatShading: THREE.FlatShading,
    });
    const geometry = new THREE.SphereGeometry(1, 9, 9);

    const top = new THREE.Mesh(geometry, material);
    top.scale.x -= 0.4;
    top.scale.y -= 0.4;
    top.scale.z -= 0.4;
    top.position.y += 2
    const middle = new THREE.Mesh(geometry, material);
    middle.scale.x -= 0.2;
    middle.scale.y -= 0.2;
    middle.scale.z -= 0.2;
    middle.position.y += 1
    const bottom = new THREE.Mesh(geometry, material);
    bottom.scale.y -= 0.2;

    group.add(top);
    group.add(middle);
    group.add(bottom);

    const noseGeometry = new THREE.ConeGeometry(0.1, 0.8, 4);
    const noseMaterial = new THREE.MeshStandardMaterial({
        color: 'orange',
        flatShading: THREE.FlatShading
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.rotation.z -= Math.PI / 2
    nose.position.y += 2;
    nose.position.x += 0.9;
    group.add(nose);

    group.position.x -= 3;
    group.position.z -= 2;
    group.position.y -= 1.2;

    let snowmanFace = addSnowmanSmile();

    snowmanFace.position.x = 0.5;
    snowmanFace.position.y = 2.2;
    group.add(snowmanFace)

    let hat = addHat();
    hat.position.x = 0.5;
    hat.position.y = 2.2;
    group.add(hat)

    group.rotation.y -= Math.PI / 4
    mainGroup.add(group);

}

function addSnowmanSmile() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
        color: 'black',
        side: THREE.FrontSide,
        flatShading: THREE.FlatShading,
    });
    const geometry = new THREE.SphereGeometry(1, 6, 6);


    for (let i = 0; i < 6; i++) {
        const tooth = new THREE.Mesh(geometry, material);
        tooth.position.z = 0.3 - i / 8 + 0.01;
        tooth.position.y -= 0.4 - Math.cos(i * 5) / 22;

        tooth.scale.x = 0.05;
        tooth.scale.y = 0.05;
        tooth.scale.z = 0.05;
        group.add(tooth);
    }

    for (let i = 0; i < 2; i++) {
        const eye = new THREE.Mesh(geometry, material);
        eye.position.z = 0.25 - i / 2 + 0.01;

        eye.scale.x = 0.1;
        eye.scale.y = 0.1;
        eye.scale.z = 0.1;
        group.add(eye);
    }

    for (let i = 0; i < 3; i++) {
        const chestButton = new THREE.Mesh(geometry, material);
        chestButton.position.y = -0.75 - i / 3 + 0.015;
        chestButton.position.x = 0.25;

        chestButton.scale.x = 0.1;
        chestButton.scale.y = 0.1;
        chestButton.scale.z = 0.1;
        group.add(chestButton);
    }

    return group;
}
function addHat() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
        color: 'rgb(60, 60, 60)',
        flatShading: THREE.FlatShading,
    });

    const topGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 10);
    const topCylinder = new THREE.Mesh(topGeometry, material);
    topCylinder.receiveShadow = true;
    topCylinder.position.y = 0.5;
    topCylinder.position.x -= 0.5;

    const bottomGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 10);
    const bottomCylinder = new THREE.Mesh(bottomGeometry, material);
    bottomCylinder.receiveShadow = true;
    bottomCylinder.position.y = 0.3;
    bottomCylinder.position.x -= 0.5;
    group.add(bottomCylinder);
    group.add(topCylinder);

    mainGroup.add(group);

    return group;
}

function addWindows() {

    let windowGroup = new THREE.Group();


    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {

            let group = new THREE.Group();
            const borderMaterial = new THREE.MeshStandardMaterial({
                color: 'rgb(60, 60, 60)',
                flatShading: THREE.FlatShading,
            });

            const borderGeometry = new THREE.BoxBufferGeometry(0.1, 1, 0.3);

            const top = new THREE.Mesh(borderGeometry, borderMaterial);
            top.rotation.z -= Math.PI / 2
            top.position.y += 0.4;

            const bottom = new THREE.Mesh(borderGeometry, borderMaterial);
            bottom.rotation.z -= Math.PI / 2
            bottom.position.y -= 0.4;

            const left = new THREE.Mesh(borderGeometry, borderMaterial);
            left.position.x -= 0.4;

            const right = new THREE.Mesh(borderGeometry, borderMaterial);
            right.position.x += 0.4;

            let window = new THREE.PointLight(0xffee88, 1, 10, 2);
            let bulbMat = new THREE.MeshStandardMaterial({
                emissive: '#ffd684',
                emissiveIntensity: 12,
                color: '#ffd684'
            });

            const windowGeometry = new THREE.PlaneGeometry(0.8, 0.8, 5, 5);
            window.add(new THREE.Mesh(windowGeometry, bulbMat));

            window.position.z -= 0.1 * j
            window.rotation.y -= Math.PI * j

            group.add(top)
            group.add(bottom)
            group.add(left)
            group.add(right)
            group.add(window)

            group.position.z -= 1.5 * i;
            group.position.x += 3.1 * j;
            group.rotation.y -= Math.PI / 2;

            windowGroup.add(group);
        }
    }

    windowGroup.rotation.y -= Math.PI / 4;
    windowGroup.position.y += 0.5;
    windowGroup.position.x -= 0.3;
    windowGroup.position.z -= 2;
    mainGroup.add(windowGroup)
}

function addTree() {

    let group = new THREE.Group();

    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 5);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: '#5e4f32',
        flatShading: THREE.FlatShading,

    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

    trunk.position.z += 3.5;
    trunk.position.x -= 3;
    trunk.position.y -= 1.2;

    group.add(trunk)

    for (let i = 0; i < 7; i++) {
        const pineGeom = new THREE.ConeBufferGeometry(0.2 * i, 0.8, 6);
        const material = new THREE.MeshStandardMaterial({
            color: 'white',
            flatShading: THREE.FlatShading,

        });
        const treeMesh = new THREE.Mesh(pineGeom, material);


        treeMesh.position.z += 3.5;
        treeMesh.position.x -= 3;
        treeMesh.position.y = 3 - (i + 1) * 0.5;
        treeMesh.rotation.y -= Math.PI / 10 * i;

        group.add(treeMesh);
    }

    mainGroup.add(group)
}

function addLamp() {
    let group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
        color: 'white',
        flatShading: THREE.FlatShading,

    });
    const lampPoleGeom = new THREE.CylinderGeometry(0.05, 0.1, 4, 5);
    const lampPole = new THREE.Mesh(lampPoleGeom, material);

    lampPole.position.z = 4.2;
    lampPole.position.x = 4.2;
    lampPole.position.y += 0.2;


    const lampHoldGeom = new THREE.BoxBufferGeometry(0.2, 0.3, 0.2);
    const lampHold = new THREE.Mesh(lampHoldGeom, material);

    lampHold.position.z = 4.2;
    lampHold.position.x = 4.2;
    lampHold.position.y = 1.85;


    let lamp = new THREE.PointLight(0xffee88, 1, 10, 2);
    let bulbMat = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000
    });

    const lampGeometry = new THREE.SphereBufferGeometry(0.5, 4, 2);
    lamp.add(new THREE.Mesh(lampGeometry, bulbMat));

    lamp.castShadow = true;

    lamp.position.z = 4.2;
    lamp.position.x = 4.2;
    lamp.position.y = 2.2;

    lamp.scale.x = 0.3;
    lamp.scale.z = 0.3;

    group.add(lampPole)
    group.add(lampHold)
    group.add(lamp)

    mainGroup.add(group)
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

// Snow

function generateSnow() {
    let count = 20000;
    var geometry = new THREE.BufferGeometry();
    let positions = new Float32Array(3 * count)
    let speedParam = new Float32Array(count)

    for (var i = 0; i < count; i++) {
        var dot = new THREE.Vector3();
        dot.x = THREE.Math.randFloatSpread(10);
        dot.y = THREE.Math.randFloatSpread(15);
        dot.z = THREE.Math.randFloatSpread(10);
        dot.toArray(positions, i * 3)

        var speed = 0.02 + Math.random() / 100
        speedParam[i] = speed
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speedParam, 1));

    let material = new THREE.PointsMaterial({
        size: 0.03,
        color: 'white'
    });
    let mesh = new THREE.Points(geometry, material);
    scene.add(mesh)
    return mesh;
}


function rain() {

    for (let index = 0, i = 0; index < positions.length; index += 3, i++) {

        positions[index + 1] -= speeds[i];

        if (positions[index] > 13) {
            positions[index] = THREE.Math.randFloatSpread(13);
        }

        if (positions[index + 1] < mainGroup.position.y - 1.5) {
            positions[index + 1] = 4 + THREE.Math.randFloatSpread(10)
        }

        if (positions[index + 2] > 13) {
            positions[index + 2] = THREE.Math.randFloatSpread(13);
        }
    }
}

function render(time) {
    time *= 0.0005;

    mainGroup.position.y = Math.sin(time)

    checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

    requestAnimationFrame(render);
    rain();
    controls.update();
    pointCloud.geometry.attributes.position.needsUpdate = true;


    renderer.render(scene, camera);
}



init();
addLight();
addPointLight();
makePlane();
addSnowman();
addHouse();
addTree();
addLamp();
scene.fog = new THREE.FogExp2('rgb(185, 207, 247)', 0.1);
scene.add(mainGroup)


let pointCloud = generateSnow();
var positions = pointCloud.geometry.attributes.position.array;
var speeds = pointCloud.geometry.attributes.speed.array;

render();
