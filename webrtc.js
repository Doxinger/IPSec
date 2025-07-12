$(document).ready(function() {
    checkWebRTCLeak();
});

function checkWebRTCLeak() {
    const webrtcSection = `
    <div class="card mt-4 animate__animated animate__fadeIn">
        <div class="card-header bg-warning text-dark">
            <h3 class="m-0"><i class="bi bi-shield-exclamation me-2"></i>WebRTC</h3>
        </div>
        <div class="card-body">
            <div class="info-item">
                <span class="info-label">Локальный IP:</span>
                <span id="local-ip" class="info-value">Проверка...</span>
            </div>
            <div class="info-item">
                <span class="info-label">Публичный IP:</span>
                <span id="public-ip" class="info-value">Проверка...</span>
            </div>
            <div class="info-item">
                <span class="info-label">Статус:</span>
                <span id="webrtc-status" class="info-value">Проверка...</span>
            </div>
        </div>
    </div>
    `;
    
    $('.container').append(webrtcSection);

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
