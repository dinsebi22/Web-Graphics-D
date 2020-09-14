import { RenderPass } from "https://threejs.org/examples/jsm/postprocessing/RenderPass.js";

import { MaskPass } from "https://threejs.org/examples/jsm/postprocessing/MaskPass.js";
import { CopyShader } from "https://threejs.org/examples/jsm/shaders/CopyShader.js";
import { ConvolutionShader } from "https://threejs.org/examples/jsm/shaders/ConvolutionShader.js";
import { LuminosityHighPassShader } from "https://threejs.org/examples/jsm/shaders/LuminosityHighPassShader.js";

import { ShaderPass } from "https://threejs.org/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "https://threejs.org/examples/jsm/shaders/FXAAShader.js";
import { UnrealBloomPass } from "https://threejs.org/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "https://threejs.org/examples/jsm/postprocessing/EffectComposer.js";

let geometry, mesh, renderScene, composer;
let sizeX = 200;
let sizeZ = 200;

// Canvas
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setClearColor("black", 1);

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  50000
);
camera.position.y = 25;
camera.position.z = 200;
camera.position.x = 2;
const n = noise;

function setFog(color, near, far) {
  scene.fog = new THREE.Fog(color, near, far);
}

let moon = undefined;

function postProcessing() {
  //    Note for bloom https://jsfiddle.net/yp2t6op6/3/

  var bloomStrength = 1.5;
  var bloomRadius = 0;
  var bloomThreshold = 0;

  geometry = new THREE.PlaneGeometry(400, 400, sizeX, sizeZ);
  var material = new THREE.LineBasicMaterial({
    color: "black",
    wireframe: true,
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  addMoon1();
  addMoon2();

  renderScene = new RenderPass(scene, camera);

  var effectFXAA = new ShaderPass(FXAAShader);
  effectFXAA.uniforms["resolution"].value.set(
    1 / window.innerWidth,
    1 / window.innerHeight
  );

  var copyShader = new ShaderPass(CopyShader);
  copyShader.renderToScreen = true;

  var bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloomStrength,
    bloomRadius,
    bloomThreshold
  );

  composer = new EffectComposer(renderer);

  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(renderScene);
  composer.addPass(effectFXAA);
  composer.addPass(effectFXAA);
  composer.addPass(bloomPass);
  composer.addPass(copyShader);

  window.onresize = onResize;

  onResize();

  requestAnimationFrame(animate);
}

function addMoon1() {
  var moonGeometry = new THREE.SphereGeometry(75, 20, 20);
  var moonMaterial = new THREE.MeshBasicMaterial();
  moon = new THREE.Mesh(moonGeometry, moonMaterial);

  moon.position.z = -400;
  moon.position.y = 350;

  scene.add(moon);
}

function addMoon2() {
  var moonGeometry = new THREE.SphereGeometry(50, 20, 20);
  var moonMaterial = new THREE.MeshBasicMaterial({
    color: "black",
    fog: false,
  });
  moon = new THREE.Mesh(moonGeometry, moonMaterial);

  moon.position.z = -350;
  moon.position.y = 325;
  moon.position.x = 20;

  scene.add(moon);
}

function onResize(e) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

postProcessing();

let speed = 2;
let width = 4;

function walkTerrain(time) {
  let index = 0;
  let height = 150;
  for (let i = 0; i < sizeX; i++) {
    for (let j = 0; j < sizeZ; j++) {
      index += 1;
      if (j > sizeX / 2 - width && j < sizeX / 2 + width) {
        geometry.vertices[index].z = 20 + height;
      } else {
        geometry.vertices[index].z =
          n.simplex2(i / 40 + time, j / 40 + time) * 15 +
          n.simplex2(i / 10 + time, j / 10 + time) * 10 +
          n.simplex2(i / 5 + time, j / 5 + time) * 5;
      }
    }
    height -= 0.85;
    index += 1;
  }
}

function animate(time) {
  time *= 0.0001;
  walkTerrain(time);

  composer.render();
  geometry.verticesNeedUpdate = true;
  requestAnimationFrame(animate);
}

setFog("white", -90, 900);
