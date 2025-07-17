async function checkTorIP() {
  try {
    const response = await fetch('https://check.torproject.org/api/ip');
    const data = await response.json();
    return {
      isTor: data.IsTor || false,
      ip: data.IP || '',
      country: data.CountryCode || '',
      exitNode: data.Hostname || ''
    };
  } catch (error) {
    console.error('Tor check failed:', error);
    return {
      isTor: false,
      ip: '',
      country: '',
      exitNode: ''
    };
  }
}

function updateTorCard(result) {
  const statusEl = document.getElementById('tor-status');
  const ipEl = document.getElementById('tor-ip');
  const nodeEl = document.getElementById('tor-node');
  
  statusEl.textContent = result.isTor ? 'Обнаружен' : 'Не обнаружен';
  statusEl.className = result.isTor ? 'text-danger' : 'text-success';
  
  ipEl.textContent = result.ip || 'Не доступно';
  nodeEl.textContent = result.exitNode || 'Не доступно';
  
  document.getElementById('tor-country').textContent = result.country || 'Не определено';
  document.getElementById('tor-check-time').textContent = new Date().toLocaleString();
}

document.getElementById('run-tor-check').addEventListener('click', async () => {
  document.getElementById('tor-status').textContent = 'Проверка...';
  const result = await checkTorIP();
  updateTorCard(result);
});

document.addEventListener('DOMContentLoaded', async () => {
  const result = await checkTorIP();
  updateTorCard(result);
});
