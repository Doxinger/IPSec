function getStableFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;

  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Browser Fingerprint', canvas.width/2, canvas.height/2);

  const pixelData = ctx.getImageData(50, 30, 1, 1).data;
  const hash = 'fp_' + 
    pixelData[0].toString(16).padStart(2, '0') + 
    pixelData[1].toString(16).padStart(2, '0') + 
    pixelData[2].toString(16).padStart(2, '0');

  return {
    image: canvas.toDataURL(),
    hash: hash
  };
}

(function() {
  const fp = getStableFingerprint();
  const canvas = document.getElementById('canvasFingerprint');
  const ctx = canvas.getContext('2d');
  
  const img = new Image();
  img.src = fp.image;
  img.onload = function() {
    ctx.drawImage(img, 0, 0);
    document.getElementById('canvasHash').textContent = `Hash: ${fp.hash}`;
  };
})();
