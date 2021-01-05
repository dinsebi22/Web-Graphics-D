import "https://cdnjs.cloudflare.com/ajax/libs/three.js/r120/three.min.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { ParametricGeometries } from "https://gitcdn.link/repo/mrdoob/three.js/master/examples/jsm/geometries/ParametricGeometries.js";

let canvas;
let renderer;
let scene;
let camera;
let controls;

let board = [];
let whitePieces = [];
let blackPieces = [];

let INTERSECTED;
let selectedPiece;

function initCanvas() {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas)
}

function init() {
    initCanvas()
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setClearColor('#1f1f1f')
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.z = 10;
    camera.position.x = 3.6;
    camera.position.y = 3;

    addLight();
    addControls();
}

function addControls() {
    controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 15;
    controls.target = new THREE.Vector3(3.6, 0, 3.6)
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
function addLight() {
    let bulbLight = new THREE.PointLight('#fff', 2, 100, 1);

    bulbLight.position.set(3.5, 10, 3.5);
    scene.add(bulbLight);
}

////////////////////////////////////////////

class ChessTile {
    constructor(geom, material, x, y, color) {
        this.x = x;
        this.y = y;
        this.mesh = new THREE.Mesh(geom, material);
        this.scaleMesh();

        this.mesh.position.x = x
        this.mesh.position.z = y
        this.mesh.tileColor = color;
        this.mesh.chessObjectType = 'Tile'
        this.mesh.chessPiece = null;
    }

    scaleMesh() {
        this.mesh.scale.y = 0.1;
        this.mesh.scale.x = 0.95;
        this.mesh.scale.z = 0.95;
    }

}

class ChessPiece {
    setMeshPosition(mesh, tile, height) {
        mesh.position.x = tile.mesh.position.x;
        mesh.position.y = height;
        mesh.position.z = tile.mesh.position.z;
    }
}

class Pawn extends ChessPiece {
    constructor(tile, color) {
        super();
        this.pieceColor = color;
        let pawnGeom = new THREE.ConeBufferGeometry(0.43, 1.8, 3, 1);
        let pawnMat = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 10,
            flatShading: THREE.FlatShading,
        });
        this.mesh = new THREE.Mesh(pawnGeom, pawnMat);
        this.mesh.pieceColor = color;
        super.setMeshPosition(this.mesh, tile, 0.9)
        this.mesh.chessObjectType = 'Piece'
        this.tile = tile;
    }

}

class Bishop extends ChessPiece {
    constructor(tile, color) {
        super();
        this.pieceColor = color;
        let pawnGeom = new THREE.OctahedronBufferGeometry(1, 0)
        let pawnMat = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 10,
            flatShading: THREE.FlatShading,
        });
        this.mesh = new THREE.Mesh(pawnGeom, pawnMat);
        this.mesh.pieceColor = color;
        this.adjustMesh();
        super.setMeshPosition(this.mesh, tile, 1)
        this.mesh.chessObjectType = 'Piece'
        this.tile = tile;
    }

    adjustMesh() {
        this.mesh.scale.x = 0.3;
        this.mesh.scale.z = 0.3;
    }
}

class Knight extends ChessPiece {
    constructor(tile, color, side) {
        super();
        this.pieceColor = color;
        let bishopGeom = new THREE.ParametricGeometry(ParametricGeometries.klein, 6, 8);
        let bishopMat = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 10,
            flatShading: THREE.FlatShading,
        });
        this.mesh = new THREE.Mesh(bishopGeom, bishopMat);
        this.mesh.pieceColor = color;
        super.setMeshPosition(this.mesh, tile, 0.75)
        this.adjustMesh(side);
        this.mesh.chessObjectType = 'Piece'
        this.tile = tile;
    }

    adjustMesh(side) {
        this.mesh.scale.x = 0.1;
        this.mesh.scale.y = 0.1;
        this.mesh.scale.z = 0.09;
        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.rotation.z = Math.PI / 2 * side;
    }

}

class Rook extends ChessPiece {
    constructor(tile, color) {
        super();
        this.pieceColor = color;
        let rookGeom = new THREE.BoxBufferGeometry(0.65, 1.2, 0.65);
        let rookMat = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 10,
            flatShading: THREE.FlatShading,
        });
        this.mesh = new THREE.Mesh(rookGeom, rookMat);
        this.mesh.pieceColor = color;
        super.setMeshPosition(this.mesh, tile, 0.75)
        this.mesh.chessObjectType = 'Piece'
        this.tile = tile;
    }
}

class Qween extends ChessPiece {
    constructor(tile, color, side) {
        super();
        this.pieceColor = color;
        let kingGeom = new THREE.SphereGeometry(1, 4, 3, 0, 6.3, 0, 3.1);
        let kingMat = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 10,
            flatShading: THREE.FlatShading,
        });
        this.mesh = new THREE.Mesh(kingGeom, kingMat);
        this.mesh.pieceColor = color;
        super.setMeshPosition(this.mesh, tile, 1.1)
        this.adjustMesh();
        this.mesh.chessObjectType = 'Piece'
        this.tile = tile;
    }

    adjustMesh() {
        this.mesh.scale.x = 0.4;
        this.mesh.scale.y = 1;
        this.mesh.scale.z = 0.4;
    }
}

class King extends ChessPiece {
    constructor(tile, color) {
        super();
        this.pieceColor = color;
        let kingGeom = new THREE.CylinderGeometry(0.5, 0.2, 1.75, 8);
        let kingMat = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 10,
            flatShading: THREE.FlatShading,
        });
        this.mesh = new THREE.Mesh(kingGeom, kingMat);
        this.mesh.pieceColor = color;
        super.setMeshPosition(this.mesh, tile, 1.1);
        this.mesh.chessObjectType = 'Piece'
        this.tile = tile;
    }
}

//////////////////////////////////////////////////////////////////

function initBoard() {
    let tileGeom = new THREE.BoxBufferGeometry(1, 1, 1);

    for (let x = 0; x < 8; x++) {
        let row = [];
        for (let y = 0; y < 8; y++) {

            let color = (x + y) % 2 === 0 ? 'white' : '#111';
            let tileMat = new THREE.MeshPhongMaterial(
                {
                    color: color,
                    shininess: 10,
                    flatShading: THREE.FlatShading,
                }
            );
            let tile = new ChessTile(tileGeom, tileMat, x, y, color);
            row.push(tile);
        }
        board.push(row);
    }
    addPieces();
}

function addPieces() {
    for (let i = 0; i < 8; i++) {
        let whitePawn = new Pawn(board[1][i], '#333')
        let blackPawn = new Pawn(board[6][i], '#fff')

        registerAndCorelatePieceAndTile(board[1][i], whitePawn)
        registerAndCorelatePieceAndTile(board[6][i], blackPawn)

    }

    for (let i = 0; i < 2; i++) {
        let whiteKnight = new Knight(board[0][1 + 5 * i], '#333', 0)
        let blackKnight = new Knight(board[board.length - 1][1 + 5 * i], '#fff', 2)

        registerAndCorelatePieceAndTile(board[0][1 + 5 * i], whiteKnight)
        registerAndCorelatePieceAndTile(board[board.length - 1][1 + 5 * i], blackKnight)
    }

    for (let i = 0; i < 2; i++) {
        let whiteBishop = new Bishop(board[0][2 + 3 * i], '#333', 0)
        let blackBishop = new Bishop(board[board.length - 1][2 + 3 * i], '#fff', 2)

        registerAndCorelatePieceAndTile(board[0][2 + 3 * i], whiteBishop)
        registerAndCorelatePieceAndTile(board[board.length - 1][2 + 3 * i], blackBishop)
    }

    for (let i = 0; i < 2; i++) {
        let whiteRook = new Rook(board[0][7 * i], '#333', 0)
        let blackRook = new Rook(board[board.length - 1][7 * i], '#fff', 2)

        registerAndCorelatePieceAndTile(board[0][7 * i], whiteRook)
        registerAndCorelatePieceAndTile(board[board.length - 1][7 * i], blackRook)
    }

    let whiteKing = new King(board[0][4], '#333', 0)
    let blackKing = new King(board[board.length - 1][4], '#fff', 2)
    registerAndCorelatePieceAndTile(board[0][4], whiteKing)
    registerAndCorelatePieceAndTile(board[board.length - 1][4], blackKing)

    let whiteQween = new Qween(board[0][3], '#333', 0)
    let blackQween = new Qween(board[board.length - 1][3], '#fff', 2)
    registerAndCorelatePieceAndTile(board[0][3], whiteQween)
    registerAndCorelatePieceAndTile(board[board.length - 1][3], blackQween)

    addTilesToScene();
    addPiecesToScene();
}

function registerAndCorelatePieceAndTile(tile, piece) {
    tile.mesh.chessPiece = piece;
    if (piece.mesh.pieceColor === '#fff') {
        whitePieces.push(piece)
    } else {
        blackPieces.push(piece)
    }
}

function addTilesToScene() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            scene.add(board[i][j].mesh)
        }
    }
}

function addPiecesToScene() {
    for (let i = 0; i < whitePieces.length; i++) {
        scene.add(whitePieces[i].mesh)
    }
    for (let i = 0; i < blackPieces.length; i++) {
        scene.add(blackPieces[i].mesh)
    }
}

window.addEventListener('click', mouseRay, false);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function highlightSelectedPiece(selectedPiece) {

    if (INTERSECTED != null) {
        INTERSECTED.material.color = INTERSECTED.currentColor;
    }

    INTERSECTED = selectedPiece;
    INTERSECTED.currentColor = INTERSECTED.material.color;
    INTERSECTED.currentEmissive = INTERSECTED.material.emissive;
    INTERSECTED.currentSpecular = INTERSECTED.material.specular;
    INTERSECTED.material.color = new THREE.Color(0.1, 0.9, 0.1);
    INTERSECTED.material.specular = new THREE.Color(0xffffff);
    INTERSECTED.material.emissive = new THREE.Color(0x30ff00);
    INTERSECTED.material.shininess = 1;
}

function unHighlightPiece() {
    if (INTERSECTED != null) {
        INTERSECTED.material.color = INTERSECTED.currentColor;
        INTERSECTED.material.specular = INTERSECTED.currentSpecular;
        INTERSECTED.material.emissive = INTERSECTED.currentEmissive;
    }

    INTERSECTED = null;
}

function mouseRay() {

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);


    if (!selectedPiece) {

        if (intersects.length > 0 && intersects[0].object.chessObjectType === 'Piece') {
            selectedPiece = intersects[0].object;
            highlightSelectedPiece(selectedPiece)
        }

    } else {

        if (intersects.length > 0 && intersects[0].object.chessObjectType === 'Tile') {

            if (intersects[0].object.chessPiece === null) {
                updatePosition(selectedPiece, intersects[0].object)
                updateTileAndPieceData(selectedPiece, intersects[0].object, "Tile")
                selectedPiece = null;

            } else if (selectedPiece.pieceColor !== intersects[0].object.chessPiece.mesh.pieceColor) {
                scene.remove(intersects[0].object.chessPiece.mesh)
                updatePosition(selectedPiece, intersects[0].object)
                updateTileAndPieceData(selectedPiece, intersects[0].object, "Tile")

                selectedPiece = null;
            }

        } else {

            if (intersects.length > 0 && intersects[0].object.chessObjectType === 'Piece') {

                if (selectedPiece.pieceColor !== intersects[0].object.pieceColor) {
                    scene.remove(intersects[0].object)
                    updatePosition(selectedPiece, intersects[0].object)
                    updateTileAndPieceData(selectedPiece, intersects[0].object, "Piece")
                    selectedPiece = null;

                } else {
                    unHighlightPiece();
                    selectedPiece = intersects[0].object;
                    highlightSelectedPiece(selectedPiece)

                }
            }
        }
    }
}

function getPiece(pieceMesh) {
    let piecesArr = (pieceMesh.pieceColor === "#fff") ? whitePieces : blackPieces;
    for (let i = 0; i < piecesArr.length; i++) {
        if (pieceMesh === piecesArr[i].mesh) {
            return piecesArr[i];
        }
    }
}

function getTile(tileMesh) {

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (tileMesh === board[i][j].mesh) {
                return board[i][j];
            }
        }
    }
}

function updatePosition(selectedPiece, selectedTile) {

    selectedPiece.position.x = selectedTile.position.x
    selectedPiece.position.z = selectedTile.position.z

    unHighlightPiece();
}

function updateTileAndPieceData(objOne, objTwo, type) {
    if (type === "Piece") {
        let pieceOne = getPiece(objOne)
        let pieceTwo = getPiece(objTwo)

        if (!pieceTwo) {
            pieceTwo = getTile(objTwo);
            pieceTwo.mesh.chessPiece.pieceColor === '#fff' ?
                whitePieces.splice(whitePieces.indexOf(pieceTwo.mesh.chessPiece), 1) :
                blackPieces.splice(blackPieces.indexOf(pieceTwo.mesh.chessPiece), 1)

            pieceOne.tile.mesh.chessPiece = null;
            pieceOne.tile = pieceTwo;
            pieceTwo.mesh.chessPiece = pieceOne;

        } else {
            pieceTwo.pieceColor === '#fff' ?
                whitePieces.splice(whitePieces.indexOf(pieceTwo), 1) : blackPieces.splice(blackPieces.indexOf(pieceTwo), 1)
            pieceOne.tile = pieceTwo.tile;
        }

    } else {
        let tile = getTile(objTwo)
        let piece = getPiece(objOne)
        piece.tile.mesh.chessPiece = null;
        piece.tile = tile;
        tile.mesh.chessPiece = piece;
    }

}


function render(time) {
    time *= 0.0005;
    checkResizeRenderDisplay(resizeRendererToDisplaySize(renderer));


    requestAnimationFrame(render);
    controls.update();

    renderer.render(scene, camera);
}

init();
initBoard();
window.addEventListener('mousemove', onMouseMove, false);



render();