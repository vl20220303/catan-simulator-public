import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export let stompClient: Client | null = null;
export let sessionId: string | null = null;

export function connect(
    onGameUpdate: (gameState: any) => void,
    headers?: { playerName: string; password: string },
    options?: { reconnectDelay?: number },
    onError?: (errorMsg: string) => void,
    onChatUpdate?: (chatMsg: any) => void,
    onPrivateChatUpdate?: (chatMsg: any) => void,
    onRequest?: (request: any) => void,
    onServerNotification?: (msg: any) => void,
    onPrivateUpdate?: (privateUpdate: any) => void,
    onConnected?: () => void
) {
    const url = `${window.location.origin}/ws?playerName=${encodeURIComponent(headers?.playerName || '')}&password=${encodeURIComponent(headers?.password || '')}`;

    stompClient = new Client({
        webSocketFactory: () => new SockJS(url),
        reconnectDelay: options?.reconnectDelay ?? 0,
        connectHeaders: headers
            ? { playerName: headers.playerName }
            : {},
        onConnect: () => {
            // Subscribe to /queue/{playerName} to retrieve the subheader
            stompClient?.subscribe(`/queue/${headers?.playerName}`, (message) => {
                sessionId = message.body;
                console.log('Received sessionId:', sessionId);
                
                if(onConnected) onConnected();

                // Now subscribe to session-specific channels
                stompClient?.subscribe(`/queue/request/${sessionId}`, (msg) => {
                    onRequest && onRequest(JSON.parse(msg.body));
                });
                stompClient?.subscribe(`/queue/message/${sessionId}`, (msg) => {
                    onServerNotification && onServerNotification(JSON.parse(msg.body));
                });
                stompClient?.subscribe(`/queue/update/${sessionId}`, (msg) => {
                    onPrivateUpdate && onPrivateUpdate(JSON.parse(msg.body));
                });
                stompClient?.subscribe(`/queue/chat/${sessionId}`, (msg) => {
                    onPrivateChatUpdate && onPrivateChatUpdate(JSON.parse(msg.body));
                });
            });
            stompClient?.subscribe("/chat/updates", (msg) => {
                onChatUpdate && onChatUpdate(JSON.parse(msg.body));
            });
            stompClient?.subscribe("/topic/updates", (msg) => {
                console.log("game update received");
                onGameUpdate && onGameUpdate(JSON.parse(msg.body));
            });
        },
        onStompError: (frame) => {
            if (onError) onError('Failed to connect: ' + frame.headers['message']);
        },
        onWebSocketClose: () => {
            if (onError) onError('Connection closed or authentication failed.');
        }
    });

    stompClient.activate();
}