// Re-skins a character's two arm meshes with the equipped arm's block texture
// (data/arms.js + components/hud/armTextures.js). Works on both the player.glb
// rig (default_arm_L / default_arm_R) and the procedural fallback character.
import { BufferAttribute, CanvasTexture, MeshStandardMaterial, NearestFilter, SRGBColorSpace } from 'three'
import { armById } from '../data/arms.js'
import { armTexture } from '../components/hud/armTextures.js'

const ARM_MESHES = ['default_arm_L', 'default_arm_R']
const materials = {} // arm id -> shared material

function armMaterial(id) {
  if (materials[id]) return materials[id]
  const mat = (materials[id] = new MeshStandardMaterial({ roughness: 0.6, metalness: 0 }))
  const img = new Image()
  img.onload = () => {
    const tex = new CanvasTexture(img)
    tex.magFilter = tex.minFilter = NearestFilter
    tex.colorSpace = SRGBColorSpace
    tex.generateMipmaps = false
    tex.needsUpdate = true
    mat.map = tex
    mat.needsUpdate = true
  }
  img.src = armTexture(armById(id))
  return mat
}

// The rig's UVs point into a character atlas, so give each arm its own geometry
// with box-mapped UVs: the 16x16 block texture then covers every face once.
function boxMapUVs(geo) {
  geo.computeBoundingBox()
  const { min, max } = geo.boundingBox
  const pos = geo.attributes.position
  const nor = geo.attributes.normal
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    const p = { x: pos.getX(i) - min.x, y: pos.getY(i) - min.y, z: pos.getZ(i) - min.z }
    const nx = Math.abs(nor.getX(i))
    const ny = Math.abs(nor.getY(i))
    const nz = Math.abs(nor.getZ(i))
    const s = { x: max.x - min.x || 1, y: max.y - min.y || 1, z: max.z - min.z || 1 }
    let u, v
    if (nx >= ny && nx >= nz) [u, v] = [p.z / s.z, p.y / s.y]
    else if (ny >= nz) [u, v] = [p.x / s.x, p.z / s.z]
    else [u, v] = [p.x / s.x, p.y / s.y]
    uv[i * 2] = u
    uv[i * 2 + 1] = v
  }
  geo.setAttribute('uv', new BufferAttribute(uv, 2))
}

// Idempotent: call every frame with the wanted arm id (null = original look).
export function applyArmSkin(avatar, armId) {
  const want = armId || null
  if (avatar.userData.armSkin === want) return
  avatar.userData.armSkin = want
  avatar.traverse((o) => {
    if (!o.isMesh || !ARM_MESHES.includes(o.name)) return
    if (!o.userData.origMaterial) {
      o.userData.origMaterial = o.material
      o.userData.origGeometry = o.geometry
    }
    if (!want) {
      o.material = o.userData.origMaterial
      o.geometry = o.userData.origGeometry
      return
    }
    if (o.geometry === o.userData.origGeometry) {
      o.geometry = o.geometry.clone()
      boxMapUVs(o.geometry)
    }
    o.material = armMaterial(want)
  })
}
