const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas });

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50000);
camera.position.z = 6
camera.position.y = 16
camera.position.x = -5
camera.rotation.x = -Math.PI * 0.28
camera.rotateY(-30 * THREE.Math.DEG2RAD)
camera.rotateZ(-30 * THREE.Math.DEG2RAD)


// var mouseX = 0;
// var mouseY = 0;
// var windowHalfX = window.innerWidth / 2;
// var windowHalfY = window.innerHeight / 2;

// function onDocumentMouseMove(event) {
//     mouseX = event.clientX - windowHalfX;
//     mouseY = event.clientY - windowHalfY;
// }
// document.addEventListener('mousemove', onDocumentMouseMove, false);

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
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 20);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
}

let cubesArr = [];

function cubes(xCount, yCount, zCount) {

    const boxHeight = 1;
    const boxWidth = 1;
    const boxDepth = 1;
    var material = new THREE.MeshLambertMaterial({ color: 'white' });

    for (let i = 0; i < zCount; i++) {
        let depth = []
        for (let j = 0; j < yCount; j++) {
            let height = [];
            for (let k = 0; k < xCount; k++) {
                if (Math.floor(Math.random() * 2) == 1) {

                    var geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);
                    geometry.translate(i * 1.1, j * 1.1, -k * 1.1)
                    var cube = new THREE.Mesh(geometry, material);
                    // cube.material.wireframe = true;
                    height.push(cube)
                    scene.add(cube);
                } else {
                    height.push(null)
                }
            }
            depth.push(height)

        }
        cubesArr.push(depth)
    }
}

addLight();
cubes(10, 10, 10);

function checkIfExists(cell) {
    var exists = 0;
    cell != null ? exists = 1 : exists = 0;
    return exists
}

function checkIfValid(cellI, cellJ, cellK, size) {
    if (cellI < 0 || cellI >= size ||
        cellJ < 0 || cellJ >= size ||
        cellK < 0 || cellK >= size) {
        return false;
    }
    return true;
}

function addCell(cellI, cellJ, cellK, arr) {
    var material = new THREE.MeshLambertMaterial({ color: 'white' });
    var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    var cube = new THREE.Mesh(geometry, material);
    // cube.material.wireframe = true;
    scene.add(cube);
    return cube;
}


function getNeighbours(cellI, cellJ, cellK, arr) {

    let neightbours = {
        topNeighbours: {
            center: checkIfValid(cellI, cellJ + 1, cellK, arr.length) ? checkIfExists(arr[cellI][cellJ + 1][cellK]) : 0,
            up: checkIfValid(cellI, cellJ + 1, cellK + 1, arr.length) ? checkIfExists(arr[cellI][cellJ + 1][cellK + 1]) : 0,
            down: checkIfValid(cellI, cellJ + 1, cellK - 1, arr.length) ? checkIfExists(arr[cellI][cellJ + 1][cellK - 1]) : 0,
            left: checkIfValid(cellI - 1, cellJ + 1, cellK, arr.length) ? checkIfExists(arr[cellI - 1][cellJ + 1][cellK]) : 0,
            right: checkIfValid(cellI + 1, cellJ + 1, cellK, arr.length) ? checkIfExists(arr[cellI + 1][cellJ + 1][cellK]) : 0,
            upLeft: checkIfValid(cellI - 1, cellJ + 1, cellK + 1, arr.length) ? checkIfExists(arr[cellI - 1][cellJ + 1][cellK + 1]) : 0,
            upRight: checkIfValid(cellI + 1, cellJ + 1, cellK + 1, arr.length) ? checkIfExists(arr[cellI + 1][cellJ + 1][cellK + 1]) : 0,
            downLeft: checkIfValid(cellI - 1, cellJ + 1, cellK - 1, arr.length) ? checkIfExists(arr[cellI - 1][cellJ + 1][cellK - 1]) : 0,
            downRight: checkIfValid(cellI + 1, cellJ + 1, cellK - 1, arr.length) ? checkIfExists(arr[cellI + 1][cellJ + 1][cellK - 1]) : 0
        },
        middleNeighbours: {
            up: checkIfValid(cellI, cellJ, cellK + 1, arr.length) ? checkIfExists(arr[cellI][cellJ][cellK + 1]) : 0,
            down: checkIfValid(cellI, cellJ, cellK - 1, arr.length) ? checkIfExists(arr[cellI][cellJ][cellK - 1]) : 0,
            left: checkIfValid(cellI - 1, cellJ, cellK, arr.length) ? checkIfExists(arr[cellI - 1][cellJ][cellK]) : 0,
            right: checkIfValid(cellI + 1, cellJ, cellK, arr.length) ? checkIfExists(arr[cellI + 1][cellJ][cellK]) : 0,
            upLeft: checkIfValid(cellI - 1, cellJ, cellK + 1, arr.length) ? checkIfExists(arr[cellI - 1][cellJ][cellK + 1]) : 0,
            upRight: checkIfValid(cellI + 1, cellJ, cellK + 1, arr.length) ? checkIfExists(arr[cellI + 1][cellJ][cellK + 1]) : 0,
            downLeft: checkIfValid(cellI - 1, cellJ, cellK - 1, arr.length) ? checkIfExists(arr[cellI - 1][cellJ][cellK - 1]) : 0,
            downRight: checkIfValid(cellI + 1, cellJ, cellK - 1, arr.length) ? checkIfExists(arr[cellI + 1][cellJ][cellK - 1]) : 0
        },
        bottomNeighbours: {
            center: checkIfValid(cellI, cellJ - 1, cellK, arr.length) ? checkIfExists(arr[cellI][cellJ - 1][cellK]) : 0,
            up: checkIfValid(cellI, cellJ - 1, cellK + 1, arr.length) ? checkIfExists(arr[cellI][cellJ - 1][cellK + 1]) : 0,
            down: checkIfValid(cellI, cellJ - 1, cellK - 1, arr.length) ? checkIfExists(arr[cellI][cellJ - 1][cellK - 1]) : 0,
            left: checkIfValid(cellI - 1, cellJ - 1, cellK, arr.length) ? checkIfExists(arr[cellI - 1][cellJ - 1][cellK]) : 0,
            right: checkIfValid(cellI + 1, cellJ - 1, cellK, arr.length) ? checkIfExists(arr[cellI + 1][cellJ - 1][cellK]) : 0,
            upLeft: checkIfValid(cellI - 1, cellJ - 1, cellK + 1, arr.length) ? checkIfExists(arr[cellI - 1][cellJ - 1][cellK + 1]) : 0,
            upRight: checkIfValid(cellI + 1, cellJ - 1, cellK + 1, arr.length) ? checkIfExists(arr[cellI + 1][cellJ - 1][cellK + 1]) : 0,
            downLeft: checkIfValid(cellI - 1, cellJ - 1, cellK - 1, arr.length) ? checkIfExists(arr[cellI - 1][cellJ - 1][cellK - 1]) : 0,
            downRight: checkIfValid(cellI + 1, cellJ - 1, cellK - 1, arr.length) ? checkIfExists(arr[cellI + 1][cellJ - 1][cellK - 1]) : 0
        }
    }
    return neightbours;
}


function calculateIfLives(cellI, cellJ, cellK, arr) {
    var cellNeighbours = getNeighbours(cellI, cellJ, cellK, arr);
    var top = Object.values(cellNeighbours.topNeighbours);
    var middle = Object.values(cellNeighbours.middleNeighbours);
    var bottom = Object.values(cellNeighbours.bottomNeighbours);

    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    var neighboursCount = top.reduce(reducer) + middle.reduce(reducer) + bottom.reduce(reducer);

    if (arr[cellI][cellJ][cellK] != null) {
        if (neighboursCount < 4) {
            removeObject(arr[cellI][cellJ][cellK]);
            arr[cellI][cellJ][cellK] = null
        } else if (neighboursCount > 6) {
            removeObject(arr[cellI][cellJ][cellK]);
            arr[cellI][cellJ][cellK] = null
        }
    } else {
        if (neighboursCount >= 5 && neighboursCount <= 6) {
            arr[cellI][cellJ][cellK] = addCell([cellI, cellJ, cellK, arr])
            arr[cellI][cellJ][cellK].geometry.translate(cellI * 1.1, cellJ * 1.1, -cellK * 1.1)

        }
    }

}

function doGeneration(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[0].length; j++) {
            for (let k = 0; k < arr[0][0].length; k++) {
                calculateIfLives(i, j, k, arr)
            }
        }
    }
}

function removeObject(obj) {
    const object = scene.getObjectByProperty('uuid', obj.uuid);

    object.geometry.dispose();
    object.material.dispose();
    scene.remove(object);
}

let count = 0;

function animate() {
    checkResizeRendererDisplay(resizeRendererToDisplaySize(renderer));

    // camera.position.x = 5 + (mouseX - camera.position.x) * .01;
    // camera.position.y = 10 + (-mouseY - camera.position.y) * .01;
    console.log('Gen: ' + count);
    count++;

    doGeneration(cubesArr);

    renderer.render(scene, camera)
        // requestAnimationFrame(animate)

}

// requestAnimationFrame(animate);

setInterval(() => {
    checkResizeRendererDisplay(resizeRendererToDisplaySize(renderer));

    console.log('Gen: ' + count);
    count++;

    doGeneration(cubesArr);

    renderer.render(scene, camera)
}, 100);