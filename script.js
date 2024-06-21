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
});

setInterval(async() => {
    for (const username in streamsData) {
        const status = await getStreamStatus(username);
        updateTableRow(username, status, streamsData[username].lastCheck);
        streamsData[username] = { status, lastCheck: new Date().toLocaleTimeString() };
    }
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
            console.error('Error in API response:', responseData.message);
            return 'Offline'; // Return 'Offline' on error
        }
        return responseData.data.length > 0 ? 'Live' : 'Offline';
    } catch (error) {
        console.error('Error getting stream status:', error);
        return 'Offline'; // Return 'Offline' on error
    }
}

function updateTable(username, status) {
    const resultBody = document.getElementById('resultBody');
    const newRow = resultBody.insertRow();
    newRow.id = username; // Set username as row ID for identification
    const usernameCell = newRow.insertCell(0);
    const statusCell = newRow.insertCell(1);
    const lastCheckCell = newRow.insertCell(2);

    usernameCell.textContent = username;
    statusCell.textContent = status;
    lastCheckCell.textContent = new Date().toLocaleTimeString(); // Add last check time for this row

    // Add color class based on status
    statusCell.classList.add(status.toLowerCase());
}

function updateTableRow(username, status, lastCheck) {
    const row = document.getElementById(username);
    if (row) {
        const statusCell = row.cells[1];
        const lastCheckCell = row.cells[2];
        statusCell.textContent = status;
        lastCheckCell.textContent = lastCheck;

        // Update color class based on status
        statusCell.className = '';
        statusCell.classList.add(status.toLowerCase());
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