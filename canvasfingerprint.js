function generateCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 100;
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsl(${Math.floor(Math.random()*360)}, 80%, 60%)`);
    gradient.addColorStop(1, `hsl(${Math.floor(Math.random()*360)}, 80%, 60%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 18px "Arial", "Helvetica", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText('Browser Fingerprint', canvas.width/2, canvas.height/2);
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    for(let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random()*canvas.width, Math.random()*canvas.height);
        ctx.lineTo(Math.random()*canvas.width, Math.random()*canvas.height);
        ctx.stroke();
    }
    
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 0;
    for(let i = 0; i < imgData.length; i += 10) {
        hash = (hash << 5) - hash + imgData[i];
        hash |= 0;
    }
    
    return {
        visual: canvas.toDataURL(),
        hash: Math.abs(hash).toString(36).slice(0, 12)
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const fp = generateCanvasFingerprint();
    const displayCanvas = document.getElementById('canvasFingerprint');
    const ctx = displayCanvas.getContext('2d');
    
    const img = new Image();
    img.src = fp.visual;
    img.onload = () => ctx.drawImage(img, 0, 0);
    
    document.getElementById('canvasHash').textContent = `Hash: ${fp.hash}`;
});
