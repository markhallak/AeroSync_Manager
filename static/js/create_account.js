document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('create-account-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById("username-input").value;

        const postData = {
            'username': username
        };

        fetch('/auth/createAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        }).then(response => {
            if (response.status === 201) {
                window.location.href = "/";
            } else if (response.status === 406) {
                console.error("Can't create account");
            }
        })
        .catch(error => {
            if (!navigator.onLine) {
                console.error('No internet connection');
            } else {
                console.error('Fetch error:', error);
            }
        });
    });
});
