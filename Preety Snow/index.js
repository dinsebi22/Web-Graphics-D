const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
let scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
camera.position.z = 50;

function setFog(color, near, far) {
    scene.fog = new THREE.Fog(color, near, far);
}
setFog('#000', 0, 50)

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

function generate() {
    let count = 500000;
    var geometry = new THREE.BufferGeometry();
    let positions = new Float32Array(3 * count)

    for (var i = 0; i < count; i++) {
        var dot = new THREE.Vector3();
        dot.x = THREE.Math.randFloatSpread(Math.sqrt(Math.random()) * 100);
        dot.y = THREE.Math.randFloatSpread(Math.sqrt(Math.random()) * 100);
        dot.z = THREE.Math.randFloatSpread(Math.sqrt(Math.random()) * 100)
        dot.toArray(positions, i * 3)
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var textureLoader = new THREE.TextureLoader();
    var sprite = textureLoader.load('https://img.icons8.com/dusk/64/000000/snowflake.png');

    let material = new THREE.PointsMaterial({
        color: 'white',
        size: 0.2,
        map: sprite,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: false
    });
    let mesh = new THREE.Points(geometry, material);
    scene.add(mesh)
    return mesh;
}

let cloud = generate();
console.log(cloud)

function rotateCloud(time) {
    cloud.geometry.rotateX(Math.PI / 4000)
}

function animate(time) {
    time *= 0.01;

    checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));

    rotateCloud(time)

    cloud.geometry.verticesNeedUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}


requestAnimationFrame(animate);