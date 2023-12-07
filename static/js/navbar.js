$(document).ready(function() {
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();
        if (scroll > 50) {
            $('.navbar').addClass('transparent');
        } else {
            $('.navbar').removeClass('transparent');
        }
    });

    $('.dropdown-toggle').dropdown();
});

document.getElementById('userIcon').addEventListener('click', () => {
    fetch('/logout', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then()
    .catch(error => {
        if (!navigator.onLine) {
            console.error('No internet connection');
        } else {
            console.error('Fetch error:', error);
        }
    });
});
