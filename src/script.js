import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Textures
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')
const gradientTexture = textureLoader.load('/textures/gradients/5.jpg')

const bgTexture = textureLoader.load('textures/bg.jpg')

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
// scene.add(ambientLight)

const light = new THREE.PointLight(0xffffff, 1)
light.position.x = 2
light.position.y = 3
light.position.z = 4
scene.add(light)

const directionalLight = new THREE.DirectionalLight(0xfff0dd, 1)
directionalLight.position.set(0,5,5)
scene.add(directionalLight)

/**
 * Objects
 */
 const gltfLoader = new GLTFLoader()

//Realistic Material
const realMaterial = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    roughness: 0,
    clearcoat: 0.3,
    transmission: 1,
    thickness: 0.5,
    transparent: 0.5
})

var meshDiamond = gltfLoader.load(
    '/models/scene-2.gltf',
    (gltf) => {
       
        console.log(gltf)
        
        meshDiamond = gltf.scene.traverse((child) =>
        {
            child.material = realMaterial
        })
        
        gltf.scene.scale.set(0.6,0.6,0.7)
        gltf.scene.position.set(0.2,1,0)
        gltf.scene.rotation.set(0.4,0.3,-0.3)
        scene.add(gltf.scene)

    }
)

const bgGeometry = new THREE.PlaneGeometry(5,5)
const bgMaterial = new THREE.MeshBasicMaterial({map:bgTexture})
const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial)
bgMesh.position.set(0,0,-1)
scene.add(bgMesh)


gui.add(realMaterial,'roughness').min(0).max(1).step(0.0001)
gui.add(realMaterial, 'clearcoat').min(0).max(1).step(0.0001)
gui.add(realMaterial, 'transmission').min(0).max(1).step(0.0001)
gui.add(realMaterial, 'thickness').min(0).max(1).step(0.0001)


const material = new THREE.MeshStandardMaterial()
material.metalness = 0.7
material.roughness = 0.2
//gui.add(material, 'metalness').min(0).max(1).step(0.0001)
//gui.add(material, 'roughness').min(0).max(1).step(0.0001)
material.envMap = environmentMapTexture

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64),
    realMaterial
)
sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
sphere.position.x = -0.5

// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(1, 1, 100, 100),
//     realMaterial
// )
// plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 64, 128),
    realMaterial
)
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))
torus.position.x = 1
scene.add(sphere, torus)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0.5
camera.position.y = 1
camera.position.z = 2.5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    //plane.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

   // meshDiamond.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    //plane.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()