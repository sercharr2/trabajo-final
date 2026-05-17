import fs from 'fs'
import { Box3, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import path from 'path'
const asset = path.resolve('public','blankkeycap.glb')
const data = fs.readFileSync(asset)
const loader = new GLTFLoader()
await new Promise((resolve, reject) => {
  loader.parse(data, 'file:///', (gltf) => {
    const scene = gltf.scene
    const box = new Box3().setFromObject(scene)
    const size = new Vector3(); box.getSize(size)
    const center = new Vector3(); box.getCenter(center)
    console.log('box', box.min.toArray(), box.max.toArray())
    console.log('size', size.toArray())
    console.log('center', center.toArray())
    const meshes = []
    scene.traverse((child)=>{
      if (child.isMesh) meshes.push({name: child.name, position: child.position.toArray(), geometryType: child.geometry?.type})
    })
    console.log('meshes', meshes.length)
    meshes.slice(0,10).forEach(m=>console.log(JSON.stringify(m)))
    resolve()
  }, reject)
})
