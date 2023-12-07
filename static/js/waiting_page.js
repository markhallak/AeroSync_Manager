if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    const postData = {
        'accessToken': accessToken,
        'refreshToken': refreshToken
    };

    fetch('/auth/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
    .then(response => {
        if(response.status === 202){
        window.location.href = "/createAccount";
      }else if(response.status === 409){
        window.location.href = "/";
      }
    })
    .catch(error => {
        if (!navigator.onLine) {
            console.error('No internet connection');
        } else {
            console.error('Fetch error:', error);
        }
    });
}
