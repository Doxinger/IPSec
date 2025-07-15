function getStableFingerprint() {
  const storedFingerprint = localStorage.getItem('browserFingerprint');
  if (storedFingerprint) {
    return JSON.parse(storedFingerprint);
  }

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

  const additionalData = [
    navigator.hardwareConcurrency || 0,
    navigator.deviceMemory || 0,
    screen.width || 0,
    screen.height || 0,
    navigator.language || '',
    new Date().getTimezoneOffset(),
    !!window.chrome,
    !!window.safari
  ].join('|');

  const pixelData = ctx.getImageData(50, 30, 1, 1).data;
  const hash = 'fp_' + 
    pixelData[0].toString(16).padStart(2, '0') + 
    pixelData[1].toString(16).padStart(2, '0') + 
    pixelData[2].toString(16).padStart(2, '0') +
    '_' + hashCode(additionalData);

  const fingerprint = {
    image: canvas.toDataURL(),
    hash: hash,
    timestamp: new Date().toISOString()
  };

  localStorage.setItem('browserFingerprint', JSON.stringify(fingerprint));
  
  return fingerprint;
}

function hashCode(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

(function() {
  const fp = getStableFingerprint();
  const canvas = document.getElementById('canvasFingerprint');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = fp.image;
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      const hashElement = document.getElementById('canvasHash');
      if (hashElement) {
        hashElement.textContent = `Hash: ${fp.hash}`;
      }
    };
  }
})();
