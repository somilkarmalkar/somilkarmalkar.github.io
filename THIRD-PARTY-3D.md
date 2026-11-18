# Three.js runtime

The website vendors **Three.js 0.170.0 (r170)** under `public/vendor/`. The runtime and its small loader/environment helpers are served locally with the website. No package installation, CDN import, import map, or external runtime request is required.

Three.js is copyright 2010–2024 Three.js Authors and distributed under the MIT License. The complete license is retained at `public/vendor/LICENSE-three.txt` and is included in the public build.

## Sources

The files are from the official `three` npm package at the pinned version, distributed through jsDelivr:

| Local file | Exact source |
| --- | --- |
| `three.module.min.js` | https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js |
| `GLTFLoader.js` | https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js |
| `BufferGeometryUtils.js` | https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/utils/BufferGeometryUtils.js |
| `RoomEnvironment.js` | https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js |
| `LICENSE-three.txt` | https://cdn.jsdelivr.net/npm/three@0.170.0/LICENSE |

Official source tag: https://github.com/mrdoob/three.js/tree/r170 .

The runtime build is unchanged. The three helper files have only their static import specifiers changed: `three` resolves to `./three.module.min.js`, and GLTFLoader's `../utils/BufferGeometryUtils.js` resolves to `./BufferGeometryUtils.js`. The upstream module bodies and comments are otherwise retained. This version's runtime is self-contained; no separate `three.core` module is required.

## Use and limits

Import `THREE` from `./vendor/three.module.min.js`, `GLTFLoader` from `./vendor/GLTFLoader.js`, and `RoomEnvironment` from `./vendor/RoomEnvironment.js`. `GLTFLoader.loadAsync()` is inherited from Three.js's loader base class. `RoomEnvironment` can be passed to `PMREMGenerator.fromScene()` to provide neutral environment lighting, then disposed after the environment map is generated.

The vendored loader supports ordinary glTF/GLB meshes and embedded textures. Draco, KTX2/Basis, and Meshopt decoder packages are not included; models must not require those optional decoder integrations.

The models themselves are third-party artwork with separate authors and licenses, recorded in `ASSETS-models.json`.

## SHA-256 checksums

Checksums apply to the local files after the import-path-only changes above:

| File | SHA-256 |
| --- | --- |
| `three.module.min.js` | `08fd7545d13d2c7fb65ab691530a802dafefd638596501854f267d0fb13c39e7` |
| `GLTFLoader.js` | `d6b517ee599c974f9b3648b11621dc23d41de24adcac3c826b3985a9313f6b84` |
| `BufferGeometryUtils.js` | `b9ea77ef3aacbf82d386c33311067e6ea4a3aac4190b32e001bdd11d063fb6ae` |
| `RoomEnvironment.js` | `625d0d8ac8690a73799ea0e2c577d6260162e0da97698c4fe9b03715909ac214` |
| `LICENSE-three.txt` | `4c40a1ef62450b857c3b2aaf294936304cd552d965fbcd9d32d4c5bcf4ba4454` |
