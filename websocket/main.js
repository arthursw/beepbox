const WebSocket = require('ws');
let port = 5000;
const wss = new WebSocket.Server({ port: port });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        console.log(data)
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});

console.log('Websocket port: ', port);