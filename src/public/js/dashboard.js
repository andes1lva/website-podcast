$(document).ready(function() {
    let auth = false;
    let nextUrl = "";
    const freqs = ["88.1 MHz", "95.5 MHz", "101.9 MHz"];
    let idx = 0;
    let playing = false;

    // Rádio
    function update() {
        $('#radioVisor .freq').text(freqs[idx]);
        $('#radioVisor .status').text(playing ? "ON AIR" : "PAUSED").css('color', playing ? "#00ff41" : "#ffaa00");
    }
    $('#playBtn').click(() => { playing = !playing; update(); });
    $('#nextFreq').click(() => { idx = (idx + 1) % freqs.length; update(); });

    // Bloqueio
    $('.btn-protected').click(function() {
        if (!auth) {
            nextUrl = $(this).data('url');
            $('#loginInterceptorModal').modal('show');
        } else {
            window.location.href = $(this).data('url');
        }
    });

    $('#modalLoginForm').submit(function(e) {
        e.preventDefault();
        auth = true;
        $('#loginInterceptorModal').modal('hide');
        $('#btnLogout').show();
        if (nextUrl) window.location.href = nextUrl;
    });
});