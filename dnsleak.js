function checkDNSLeak() {
    if (!document.getElementById('dnsleak-section')) return;

    $('#dnsleak-status').html('<span class="spinner-border spinner-border-sm"></span> Проверка...');
    $('#dns-servers').text('Идёт проверка...');
    $('#run-dnsleak-test').prop('disabled', true);

    const testId = Math.floor(Math.random() * 1000000);
    const testUrls = [
        `https://dnsleaktest.com/api/dnsleak?test=${testId}`,
        `https://www.dnsleaktest.com/json/${testId}`
    ];

    let currentApi = 0;

    const tryApi = () => {
        if (currentApi >= testUrls.length) {
            fallbackMethod();
            return;
        }

        $.ajax({
            url: testUrls[currentApi],
            type: 'GET',
            dataType: 'json',
            success: (data) => {
                let servers = [];
                if (data.dns?.length) servers = data.dns.map(s => s.ip || s.address);
                else if (data.servers?.length) servers = data.servers.map(s => s.ip);

                if (servers.length) {
                    updateResults(servers);
                } else {
                    currentApi++;
                    tryApi();
                }
            },
            error: () => {
                currentApi++;
                tryApi();
            }
        });
    };

    const fallbackMethod = () => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'https://www.dnsleaktest.com/';
        document.body.appendChild(iframe);

        window.addEventListener('message', (e) => {
            if (e.origin === 'https://www.dnsleaktest.com' && e.data.servers) {
                updateResults(e.data.servers);
            }
        }, false);

        setTimeout(() => {
            if ($('#dnsleak-status').text().includes('Проверка')) {
                $('#dnsleak-status').html('<span class="text-warning">Не удалось проверить</span>');
                $('#dns-servers').text('Ошибка получения данных');
                $('#run-dnsleak-test').prop('disabled', false);
            }
            iframe.remove();
        }, 10000);
    };

    const updateResults = (servers) => {
        $('#dns-servers').html(servers.join('<br>'));
        if (servers.length > 3) {
            $('#dnsleak-status').html('<span class="text-danger">Обнаружена утечка DNS</span>');
        } else {
            $('#dnsleak-status').html('<span class="text-success">Утечек не обнаружено</span>');
        }
        $('#run-dnsleak-test').prop('disabled', false);
    };

    tryApi();
}

$(document).ready(function() {
    $('#run-dnsleak-test').click(checkDNSLeak);
    checkDNSLeak();
});
