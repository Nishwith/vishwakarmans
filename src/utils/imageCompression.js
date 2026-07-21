/**
 * Canvas API image compression: resize to max 2048px width, convert to WebP 80%.
 * Intercept before upload — drops bandwidth and storage cost by ~70%.
 *
 * @param {File} file - Original image file from <input type="file">
 * @param {object} [opts]
 * @param {number} [opts.maxWidth=2048]
 * @param {number} [opts.quality=0.8]
 * @returns {Promise<File>} Compressed WebP file, same name with .webp extension
 */
export async function compressImage(file, { maxWidth = 2048, quality = 0.8 } = {}) {
  // ponytail: skip non-images or if platform canvas API is missing (e.g. testing in jsdom)
  if (!file.type.startsWith('image/') || typeof createImageBitmap === 'undefined' || typeof OffscreenCanvas === 'undefined') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: 'image/webp', quality });
  const name = file.name.replace(/\.[^.]+$/, '.webp');
  return new File([blob], name, { type: 'image/webp', lastModified: Date.now() });
}
