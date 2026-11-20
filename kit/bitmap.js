// Shared texture loader: decodes off the main thread with ImageBitmapLoader (the old TextureLoader path decoded 2K/4K images
// synchronously inside renderer.initTexture, 100 to 170 ms long tasks mid-scroll). Upload still happens on the main thread.
// loadTex(THREE, url, { flipY = true, colorSpace, premultiply = false }) -> Promise<THREE.Texture>, rejects if both paths fail.
// flipY maps to imageOrientation (ImageBitmap textures must keep texture.flipY = false in three). colorSpaceConversion is always
// 'none' and premultiplyAlpha 'none' unless asked, so data maps (16-bit DTM packed in RG, normals) keep their exact bytes.
const hasBitmap = () => typeof createImageBitmap === 'function';

export async function loadTex(THREE, url, { flipY = true, colorSpace, premultiply = false } = {}) {
  let tex = null;
  if (hasBitmap()) {
    try {
      const ld = new THREE.ImageBitmapLoader(); ld.setCrossOrigin('anonymous');
      ld.setOptions({ imageOrientation: flipY ? 'flipY' : 'none', premultiplyAlpha: premultiply ? 'premultiply' : 'none', colorSpaceConversion: 'none' });
      const bmp = await new Promise((res, rej) => ld.load(url, res, undefined, rej));
      tex = new THREE.Texture(bmp); tex.flipY = false; // the flip is already in the bitmap
      tex.addEventListener('dispose', () => { try { bmp.close(); } catch (e) { /* already closed */ } });
    } catch (e) { tex = null; } // old Safari (no options) or a bad load: fall through to the image path
  }
  if (!tex) { // fallback: HTMLImageElement, decode capped (it can stall in a background tab)
    const ld = new THREE.TextureLoader(); ld.setCrossOrigin('anonymous');
    tex = await new Promise((res, rej) => ld.load(url, res, undefined, () => rej(new Error('texture failed: ' + url))));
    const img = tex.image;
    if (img && img.decode) await Promise.race([img.decode().catch(() => {}), new Promise(r => setTimeout(r, 400))]);
    tex.flipY = flipY; tex.premultiplyAlpha = premultiply;
  }
  if (colorSpace) tex.colorSpace = colorSpace;
  tex.needsUpdate = true;
  return tex;
}
