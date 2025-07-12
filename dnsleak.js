function checkDNSLeak() {
    if (!document.getElementById('dnsleak-section')) return;

    $('#dnsleak-status').html('<span class="spinner-border spinner-border-sm" role="status"></span> Проверка...');
    $('#dns-servers').text('Загрузка...');
    $('#run-dnsleak-test').prop('disabled', true);

    const testDomains = [
        'test1.dnsleaktest.com',
        'test2.dnsleaktest.com',
        'test3.dnsleaktest.com',
        'test4.dnsleaktest.com'
    ];

    let requestsCompleted = 0;
    const dnsServers = new Set();

    testDomains.forEach(domain => {
        const img = new Image();
        img.src = `https://${domain}/image.png?rand=${Math.random()}`;
        img.onerror = function() {
            requestsCompleted++;
            checkCompletion();
        };
    });

    function checkCompletion() {
        if (requestsCompleted === testDomains.length) {
            if (dnsServers.size === 0) {
                detectDNSServers();
            } else {
                displayResults();
            }
        }
    }

    function detectDNSServers() {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'https://www.dnsleaktest.com/';
        document.body.appendChild(iframe);

        setTimeout(() => {
            iframe.remove();
            displayResults();
        }, 3000);
    }

    function displayResults() {
        if (dnsServers.size > 0) {
            const serverList = Array.from(dnsServers).join('\n');
            $('#dns-servers').html(serverList.replace(/\n/g, '<br>'));
            
            if (dnsServers.size > 3) {
                $('#dnsleak-status').html('<span class="text-danger">Обнаружена возможная утечка DNS</span>');
            } else {
                $('#dnsleak-status').html('<span class="text-success">Утечки не обнаружено</span>');
            }
        } else {
            $('#dnsleak-status').html('<span class="text-warning">Не удалось определить DNS-серверы</span>');
            $('#dns-servers').text('Недоступно');
        }
        $('#run-dnsleak-test').prop('disabled', false);
    }

    window.addEventListener('message', function(e) {
        if (e.origin === 'https://www.dnsleaktest.com' && e.data.type === 'dnsServers') {
            e.data.servers.forEach(server => dnsServers.add(server));
        }
    }, false);
}

$(document).ready(function() {
    $('#run-dnsleak-test').click(function() {
        checkDNSLeak();
    });
}); 
