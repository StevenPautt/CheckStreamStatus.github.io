document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simulate authentication
    if (username === 'admin' && password === 'password') {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'main.html';
    } else {
        alert('Invalid username or password');
    }
});