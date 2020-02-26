import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas });

let scene = new THREE.Scene();
scene.background = new THREE.Color('black');

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50000);
camera.position.z = 1500
camera.position.x = 300
camera.position.y = 1000
camera.rotation.x = -Math.PI * 0.2;

var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enablePan = false;
controls.minDistance = 1000;
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

function generateStars() {
    let count = 15000;
    var geometry = new THREE.BufferGeometry();
    let positions = new Float32Array(3 * count)

    for (var i = 0; i < count; i++) {
        var dot = new THREE.Vector3();
        dot.x = THREE.Math.randFloatSpread(Math.sqrt(Math.random()) * 100) * 100;
        dot.y = THREE.Math.randFloatSpread(Math.sqrt(Math.random()) * 100) * 100;
        dot.z = THREE.Math.randFloatSpread(Math.sqrt(Math.random()) * 100) * 100;
        dot.toArray(positions, i * 3)
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    let material = new THREE.PointsMaterial({
        size: 1
    });
    material.fog = false;

    let mesh = new THREE.Points(geometry, material);
    mesh.geometry.rotateX(-Math.PI * 0.2)
    scene.add(mesh)
    return mesh;
}

function checkResizeRendererDisplay(isRendererResize) {
    if (isRendererResize) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
}

function addLight() {
    var light = new THREE.PointLight('#aaa', 3, 2000);
    light.position.set(1000, 1000, 1000);
    scene.add(light);

    var light = new THREE.PointLight('#aaa', 3, 2000);
    light.position.set(-1000, 1000, -1000);
    scene.add(light);

    var light = new THREE.PointLight('#aaa', 3, 2000);
    light.position.set(1000, 1000, -1000);
    scene.add(light);

    var light = new THREE.PointLight('#aaa', 3, 2000);
    light.position.set(-1000, -1000, 1000);
    scene.add(light);
}

class Sun {
    constructor(radius) {
        this.radius = radius;
        var material = new THREE.MeshPhongMaterial({
            color: 0xF66120,
            emissive: 0xF66120,
            specular: 0xFFED22,
            shininess: 10,
            flatShading: THREE.FlatShading,
        });
        material.fog = false;

        var light = new THREE.PointLight('yellow', 1, 5000);
        var geometry = new THREE.IcosahedronGeometry(this.radius, 1);
        var geometry2 = new THREE.IcosahedronGeometry(this.radius, 1);
        geometry.rotateX(Math.PI / 6)
        geometry.rotateY(Math.PI / 2)

        light.add(new THREE.Mesh(geometry, material));
        let mesh = new THREE.Mesh(geometry2, material);

        this.sun = {
            sun1: light,
            sun2: mesh
        }
        scene.add(light);
        scene.add(mesh);
    }

    rotate() {
        this.sun.sun1.rotation.x += Math.PI * 0.0005
        this.sun.sun1.rotation.z += Math.PI * 0.0005

        this.sun.sun2.rotation.y += Math.PI * 0.0005
        this.sun.sun2.rotation.z -= Math.PI * 0.0005
    }
}

class Planet {
    constructor(offset, color) {
        this.offset = offset;
        this.size = 5 + Math.random() * 150;
        this.headStart = Math.random() * 100;
        this.orbitSpeed = 5 + Math.random() * 10;
        this.yAxisOffset = 2 + Math.random() * 10;
        this.color = color;
        this.rings = [];
        this.planetSpacing = 0;
        this.hasRings();
        this.planetSpacing += 30 + Math.random() * 50 + this.size;

        var material = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 10,
            flatShading: THREE.FlatShading,
        });

        var geometry = new THREE.IcosahedronGeometry(this.size, 1);
        var planet = new THREE.Mesh(geometry, material);
        this.planet = planet;
        scene.add(planet);

    }

    hasRings() {
        function ringColor() {
            var value = Math.random() * 0xFF | 0;
            var grayscale = (value << 16) | (value << 8) | value;
            var color = '#' + grayscale.toString(16);
            return color;
        }

        var hasRings = (Math.random() * 10 > 6)
        if (hasRings) {
            var ringCount = 1 + Math.floor(Math.random() * 5)
            var ringOffset = 30;
            for (let i = 0; i < ringCount; i++) {
                var outerOffset = ringOffset + 2 + Math.random() * 20
                this.addRing(ringOffset, outerOffset, ringColor())
                ringOffset = outerOffset + 10;
                this.planetSpacing += ringOffset;
            }
            this.planetSpacing += 100;
        }
    }

    addRing(innerOffset, outerOffset, color) {
        var geometry = new THREE.RingGeometry(this.size + innerOffset, this.size + outerOffset, 22);
        var material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        var ring = new THREE.Mesh(geometry, material);
        this.rings.push(ring);
        scene.add(ring);
    }


    rotate() {
        this.planet.rotation.y += Math.PI * 0.015
    }

    rotateRing(ring) {
        ring.rotation.z -= Math.PI * 0.001
    }

    planetOrbit(time) {
        this.planet.position.x = Math.cos(this.orbitSpeed / 20 * time + this.headStart) * this.offset;
        this.planet.position.z = Math.sin(this.orbitSpeed / 20 * time + this.headStart) * this.offset;
        this.planet.position.y = Math.cos(this.orbitSpeed / 20 * time + this.headStart) * this.offset / this.yAxisOffset;

        this.rotate();

        if (this.rings.length !== 0) {
            for (let i = 0; i < this.rings.length; i++) {
                this.rings[i].rotation.x = Math.PI / 2
                this.rings[i].rotation.y = -Math.PI / 10
                this.rings[i].position.x = this.planet.position.x;
                this.rings[i].position.y = this.planet.position.y;
                this.rings[i].position.z = this.planet.position.z;
                this.rotateRing(this.rings[i]);
            }
        }

    }
}

function initGalaxy(planetCount) {
    let planets = [];
    var offset = sun.radius + 200;
    for (let i = 0; i < planetCount; i++) {
        var p = new Planet(offset, 'white')
        offset += p.planetSpacing + p.size;
        planets.push(p)
    }
    return planets;
}

function animate(time) {
    time *= 0.001;
    checkResizeRendererDisplay(resizeRendererToDisplaySize(renderer));

    sun.rotate(time);

    for (let i = 0; i < solarSystem.length; i++) {
        solarSystem[i].planetOrbit(time);
    }

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true


    renderer.render(scene, camera)
    requestAnimationFrame(animate)

}


addLight();
let sun = new Sun(200);
generateStars();
let solarSystem = initGalaxy(10);

requestAnimationFrame(animate);
