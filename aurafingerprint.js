function generateDigitalAura() {
    const getTemporalPattern = () => {
        const delays = [];
        for (let i = 0; i < 5; i++) {
            const t1 = performance.now();
            let sum = 0;
            for (let j = 0; j < 1000; j++) {
                sum += Math.sqrt(Math.random());
            }
            delays.push((performance.now() - t1).toFixed(3));
        }
        return delays.join(':');
    };

    const getGlitchProfile = () => ({
        audio: (() => {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const analyser = ctx.createAnalyser();
                osc.connect(analyser);
                osc.start();
                const data = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(data);
                osc.disconnect();
                return data.slice(0, 3).join('-');
            } catch { return 'error'; }
        })(),
        dom: (() => {
            try {
                const el = document.createElement('div');
                el.innerHTML = '<svg><style>@media all {}</style>';
                return [el.innerHTML.length % 9];
            } catch { return ['error']; }
        })(),
        math: Array.from({length: 3}, (_, i) => 
            Math.random() > 0.5 + (i * 0.1) ? 1 : 0
        )
    });

    const getQuantumSignature = () => {
        const results = [];
        for (let i = 0; i < 3; i++) {
            const start = performance.now();
            const arr = new Array(1000).fill(null).map(() => 
                Math.random() * (i+1) / (performance.now() - start + 1)
            );
            results.push(arr.filter(x => x > 0.5).length % 10);
        }
        return results.join('');
    };

    const hashString = str => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
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
        version: '3.2.0',
        timestamp: new Date().toISOString()
    };
}
