export function assertImageFile(file) {
  if (!file || !file.type || !file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
}

export function assertCompressedImageSize(imageData, maxBytes = 700 * 1024) {
  if (byteLength(imageData) > maxBytes) {
    throw new Error("이미지 용량이 큽니다. 사진을 다시 선택해 주세요.");
  }
}

export async function compressImage(file, maxSize = 900, quality = 0.68) {
  assertImageFile(file);
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  const compressed = canvas.toDataURL("image/jpeg", quality);
  assertCompressedImageSize(compressed);
  return compressed;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("이미지를 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    image.src = dataUrl;
  });
}

function byteLength(value) {
  return new Blob([value]).size;
}
