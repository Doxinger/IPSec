function checkDNSLeak() {
    if (!document.getElementById('dnsleak-section')) return;

    $('#dnsleak-status').html('<span class="spinner-border spinner-border-sm"></span> Проверка...');
    $('#dns-servers').text('Идёт проверка...');
    $('#run-dnsleak-test').prop('disabled', true);

    const testDomains = [
        // Публичные DNS-серверы
        'dns.google/resolve',
        'cloudflare-dns.com/dns-query',
        'doh.opendns.com/dns-query',
        'dns.quad9.net/dns-query',
        'dns.adguard.com/dns-query',
        'dns.nextdns.io/dns-query',
        'doh.cleanbrowsing.org/doh/family-filter/dns-query',
        'dns.microsoft.com/resolve',
        'doh.libredns.gr/dns-query',
        'dns.dns-over-https.com/dns-query'
    ];

    const testApis = [
        'https://www.dnsleaktest.com/api/dnsleak',
        'https://api.dnsleak.com/v1/leaktest',
        'https://dnsleak.express/api/v1/detect'
    ];

    let completedTests = 0;
    const uniqueIps = new Set();
    const testId = Date.now();

    const checkCompletion = () => {
        if (completedTests >= (testDomains.length + testApis.length)) {
            const ips = Array.from(uniqueIps);
            $('#dns-servers').html(ips.join('<br>'));
            
            if (ips.length > 2) {
                $('#dnsleak-status').html(`<span class="text-danger">Обнаружена утечка (${ips.length} DNS)</span>`);
            } else {
                $('#dnsleak-status').html('<span class="text-success">Утечек не обнаружено</span>');
            }
            $('#run-dnsleak-test').prop('disabled', false);
        }
    };

    // Проверка DNS-over-HTTPS
    testDomains.forEach(domain => {
        $.ajax({
            url: `https://${domain}?name=example.com&type=A&cd=false&edns_client_subnet=0/0`,
            type: 'GET',
            headers: { 'Accept': 'application/dns-json' },
            success: (data) => {
                if (data.Answer) {
                    data.Answer.forEach(answer => {
                        if (answer.data && answer.data.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)) {
                            uniqueIps.add(answer.data);
                        }
                    });
                }
                completedTests++;
                checkCompletion();
            },
            error: () => {
                completedTests++;
                checkCompletion();
            }
        });
    });

    testApis.forEach(api => {
        $.ajax({
            url: `${api}?test=${testId}`,
            type: 'GET',
            success: (data) => {
                if (data.ips) {
                    data.ips.forEach(ip => uniqueIps.add(ip));
                } else if (data.servers) {
                    data.servers.forEach(server => uniqueIps.add(server.ip));
                }
                completedTests++;
                checkCompletion();
            },
            error: () => {
                completedTests++;
                checkCompletion();
            }
        });
    });

    // Fallback 
    setTimeout(() => {
        if ($('#dnsleak-status').text().includes('Проверка')) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'https://www.dnsleaktest.com/';
            document.body.appendChild(iframe);

            window.addEventListener('message', (e) => {
                if (e.origin === 'https://www.dnsleaktest.com' && e.data.servers) {
                    e.data.servers.forEach(ip => uniqueIps.add(ip));
                    checkCompletion();
                }
            }, false);

            setTimeout(() => iframe.remove(), 10000);
        }
    }, 5000);
}

$(document).ready(function() {
    $('#run-dnsleak-test').click(checkDNSLeak);
    checkDNSLeak();
});
