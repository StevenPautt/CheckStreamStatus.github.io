let lastCheckTime = null;
let streamsData = {};

document.getElementById('uploadButton').addEventListener('click', async() => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file');
        return;
    }

    const text = await file.text();
    const usernames = cleanUsernames(text);
    for (const username of usernames) {
        const status = await getStreamStatus(username);
        updateTable(username, status);
        streamsData[username] = { status, lastCheck: new Date().toLocaleTimeString() };
    }
    updateLastCheck();
    saveStreamsData();
});

setInterval(async() => {
    for (const username in streamsData) {
        const status = await getStreamStatus(username);
        updateTableRow(username, status, streamsData[username].lastCheck);
        streamsData[username] = { status, lastCheck: new Date().toLocaleTimeString() };
    }
    updateLastCheck();
    saveStreamsData();
}, 60000); // Update every 1 minute (60000 ms)

function updateLastCheck() {
    lastCheckTime = new Date().toLocaleTimeString();
    const lastCheckCell = document.getElementById('lastCheck');
    lastCheckCell.textContent = lastCheckTime;
}

async function getAccessToken() {
    const clientId = 'mr3s5fcf684x7ixorj5at6bqb0n9pc';
    const clientSecret = '6gjmao2fow65tb9u8nhewn5m6xbjuv';
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
    });
    const data = await response.json();
    return data.access_token;
}

async function getStreamStatus(username) {
    const accessToken = await getAccessToken();
    const url = `https://api.twitch.tv/helix/streams?user_login=${username}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Client-ID': 'mr3s5fcf684x7ixorj5at6bqb0n9pc',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const responseData = await response.json();
        if (responseData.error) {
            console.error('API response error:', responseData.message);
            return 'Error'; // Return 'Error' in case of API error
        }
        return responseData.data.length > 0 ? 'Live' : 'Not Live';
    } catch (error) {
        console.error('Error fetching stream status:', error);
        return 'Error'; // Return 'Error' in case of fetch error
    }
}

function updateTable(username, status) {
    const resultBody = document.getElementById('resultBody');
    const newRow = resultBody.insertRow();
    newRow.id = username; // Set the username as the row ID
    const usernameCell = newRow.insertCell(0);
    const statusCell = newRow.insertCell(1);
    const lastCheckCell = newRow.insertCell(2);

    usernameCell.textContent = username;
    statusCell.textContent = status;
    lastCheckCell.textContent = new Date().toLocaleTimeString();

    // Apply color based on status
    if (status === 'Live') {
        statusCell.style.color = 'green';
    } else if (status === 'Not Live') {
        statusCell.style.color = 'red';
    } else {
        statusCell.style.color = 'orange';
    }
}

function updateTableRow(username, status, lastCheck) {
    const row = document.getElementById(username);
    if (row) {
        const statusCell = row.cells[1];
        const lastCheckCell = row.cells[2];
        statusCell.textContent = status;
        lastCheckCell.textContent = lastCheck;

        // Apply color based on status
        if (status === 'Live') {
            statusCell.style.color = 'green';
        } else if (status === 'Not Live') {
            statusCell.style.color = 'red';
        } else {
            statusCell.style.color = 'orange';
        }
    } else {
        updateTable(username, status);
    }
}

function cleanUsernames(text) {
    const lines = text.split('\n');
    const usernames = [];
    for (const line of lines) {
        const match = line.match(/(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/i);
        if (match) {
            usernames.push(match[1]);
        }
    }
    return usernames;
}

function saveStreamsData() {
    const username = localStorage.getItem('username');
    if (username) {
        localStorage.setItem(`streamsData_${username}`, JSON.stringify(streamsData));
    }
}

function loadStreamsData() {
    const username = localStorage.getItem('username');
    if (username) {
        const storedData = localStorage.getItem(`streamsData_${username}`);
        if (storedData) {
            streamsData = JSON.parse(storedData);
            for (const [username, data] of Object.entries(streamsData)) {
                updateTable(username, data.status);
            }
            updateLastCheck();
        }
    }
}

// Load saved streams data on page load
document.addEventListener('DOMContentLoaded', loadStreamsData);