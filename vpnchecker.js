function checkVPNProxy() {
    const statusElement = $('#vpn-status');
    statusElement.html('<span class="spinner-border spinner-border-sm"></span> Проверка...');

    const apis = [
        'https://ipapi.co/json/',
        'https://ipwho.is/',
        'https://ipinfo.io/json'
    ];

    let currentApi = 0;

    const tryApi = () => {
        if (currentApi >= apis.length) {
            statusElement.html('<span class="text-warning">Не удалось проверить</span>');
            return;
        }

        $.ajax({
            url: apis[currentApi],
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                const isp = (data.org || data.connection?.isp || '').toLowerCase();
                const vpnKeywords = ['vpn', 'proxy', 'tor', 'anonymous', 'hosting', 'datacenter'];
                const isVPN = vpnKeywords.some(keyword => isp.includes(keyword));

                if (isVPN) {
                    statusElement.html(`<span class="text-danger">Обнаружено (${data.org || data.connection?.isp})</span>`);
                } else {
                    statusElement.html('<span class="text-success">Не обнаружено</span>');
                }
            },
            error: function() {
                currentApi++;
                tryApi();
            }
        });
    };

    tryApi();
}

$(document).ready(function() {
    $('#check-vpn-btn').click(checkVPNProxy);
    checkVPNProxy();
});
