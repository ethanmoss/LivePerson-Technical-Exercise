require('dotenv').config();
const axios = require('axios');
const WebSocket = require('ws');

// Create promise to return JWT token
const getToken = () => {
    const url = `https://va.idp.liveperson.net/api/account/${process.env.SITE_ID}/signup`;
    return axios.post(url);
}

// Open websocket using JWT Token and generate LivePerson conversation
const openWebSocket = tokenResponse => {
    const jwtToken = tokenResponse.data.jwt;
    const url = `wss://va.msg.liveperson.net/ws_api/account/${process.env.SITE_ID}/messaging/consumer?v=3`;

    // Create new websocket connection using LivePerson URL and JWT token
    const ws = new WebSocket(url, {
        headers: { Authorization: `jwt ${jwtToken}` }
    });

    // On websocket open, generate liveperson conversation
    ws.on('open', () => {
        console.log('Websocket successfully opened');
        ws.send('{"kind":"req","id":1,"type":"cm.ConsumerRequestConversation"}');
    });

    // When a LivePerson conversation is generated, send a message that reads: "My first message"
    ws.on('message', data => {
        const response = JSON.parse(data);
        const conversationId = response.body.conversationId;

        ws.send(`{"kind":"req","id":2,"type":"ms.PublishEvent","body":{"dialogId":"${conversationId}","event":{"type":"ContentEvent","contentType":"text/plain","message":"My first message"}}}`);
    });
}

// Resolve promises and generate conversation
getToken()
.then(jwt => openWebSocket(jwt))
.then();
