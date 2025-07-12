function checkWebRTCLeak() {
    if (!document.getElementById('webrtc-section')) return;

    $('#local-ip').text('Проверка...');
    $('#public-ip').text('Проверка...');
    $('#webrtc-status').text('Проверка...');

    try {
        const rtcConfig = {
            iceServers: [{
                urls: ["stun:stun.l.google.com:19302"]
            }]
        };

        const pc = new RTCPeerConnection(rtcConfig);
        
        pc.createDataChannel("webrtctest");
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .catch(e => {
                $('#webrtc-status').html('<span class="text-danger">Ошибка: ' + e.message + '</span>');
            });

        pc.onicecandidate = function(e) {
            if (!e.candidate) return;
            
            const candidate = e.candidate.candidate;
            const localIpMatch = candidate.match(/ ([0-9]{1,3}(\.[0-9]{1,3}){3}) /);
            const publicIpMatch = candidate.match(/ srflx .*? ([0-9]{1,3}(\.[0-9]{1,3}){3}) /);

            if (localIpMatch) {
                $('#local-ip').text(localIpMatch[1]);
            }

            if (publicIpMatch) {
                $('#public-ip').text(publicIpMatch[1]);
                
                $.ajax({
                    url: 'https://api.ipify.org?format=json',
                    success: function(data) {
                        if (publicIpMatch[1] !== data.ip) {
                            $('#webrtc-status').html('<span class="text-danger">Возможная утечка WebRTC</span>');
                        } else {
                            $('#webrtc-status').html('<span class="text-success">Утечки не обнаружено</span>');
                        }
                    },
                    error: function() {
                        $('#webrtc-status').html('<span class="text-warning">Не удалось проверить утечку</span>');
                    }
                });
            }
        };

        setTimeout(function() {
            if ($('#webrtc-status').text() === 'Проверка...') {
                $('#webrtc-status').html('<span class="text-warning">Проверка завершена (без результата)</span>');
            }
            pc.close();
        }, 5000);
    } catch (e) {
        $('#webrtc-status').html('<span class="text-danger">WebRTC не поддерживается</span>');
    }
}

$(document).ready(function() {
    checkWebRTCLeak();
});
