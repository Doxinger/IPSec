function generateDigitalAura() {
  const getTemporalPattern = () => {
    const delays = [];
    for (let i = 0; i < 5; i++) {
      const t1 = performance.now();
      Math.sqrt(Math.random());
      delays.push((performance.now() - t1).toFixed(3));
    }
    return delays.join(':');
  };

  const getGlitchProfile = () => ({
    audio: (() => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.connect(ctx.createAnalyser());
        osc.start();
        const data = new Uint8Array(1);
        osc.disconnect();
        return data.join('-');
      } catch { return 'error'; }
    })(),
    dom: (() => {
      try {
        const el = document.createElement('div');
        el.innerHTML = '<svg><style>@media {}</style>';
        return [el.innerHTML.length % 7];
      } catch { return ['error']; }
    })(),
    math: Array(3).fill().map((_,i) => 
      Math.random() * (i+1) % 0.5 > 0.25 ? 1 : 0
    )
  });

  const getQuantumSignature = () => 
    Array(3).fill().map(() => 
      Math.floor(Math.random() * 10)
    ).join('');

  const hashString = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8,'0');
  };

  const temporal = getTemporalPattern();
  const glitches = getGlitchProfile();
  const quantum = getQuantumSignature();
  const dataString = temporal + JSON.stringify(glitches) + quantum;
  const hash = hashString(dataString);

  return {
    temporal,
    glitches,
    quantum,
    hash,
    version: '3.1.4',
    timestamp: new Date().toISOString()
  };
}

function updateAuraCard() {
  const aura = generateDigitalAura();
  document.getElementById('temporal').textContent = aura.temporal;
  document.getElementById('glitch-audio').textContent = `Audio: ${aura.glitches.audio}`;
  document.getElementById('glitch-dom').textContent = `DOM: [${aura.glitches.dom}]`;
  document.getElementById('glitch-math').textContent = `Math: [${aura.glitches.math}]`;
  document.getElementById('quantum').textContent = aura.quantum;
  document.getElementById('aura-hash').textContent = aura.hash;
  document.getElementById('version').textContent = `v${aura.version}`;
  document.getElementById('timestamp').textContent = aura.timestamp;
}

document.addEventListener('DOMContentLoaded', updateAuraCard);
