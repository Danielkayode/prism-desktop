const vscode = acquireVsCodeApi();

const serverList = document.getElementById('server-list');
const addServerButton = document.getElementById('add-server-button');
const serverCommandInput = document.getElementById('server-command');
const serverArgsInput = document.getElementById('server-args');

addServerButton.addEventListener('click', () => {
    const command = serverCommandInput.value;
    const args = serverArgsInput.value.split(',').map(arg => arg.trim());
    vscode.postMessage({
        command: 'addServer',
        server: {
            command,
            args,
        },
    });
});

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'updateServerList':
            renderServerList(message.servers);
            break;
    }
});

function renderServerList(servers) {
    serverList.innerHTML = '';
    for (const server of servers) {
        const serverDiv = document.createElement('div');
        serverDiv.classList.add('server');

        const statusDiv = document.createElement('div');
        statusDiv.classList.add('server-status', server.connected ? 'connected' : 'disconnected');
        serverDiv.appendChild(statusDiv);

        const commandDiv = document.createElement('div');
        commandDiv.textContent = `${server.command} ${server.args.join(' ')}`;
        serverDiv.appendChild(commandDiv);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            vscode.postMessage({
                command: 'removeServer',
                server,
            });
        });
        serverDiv.appendChild(removeButton);

        serverList.appendChild(serverDiv);
    }
}
