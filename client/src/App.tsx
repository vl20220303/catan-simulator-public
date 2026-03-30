import React, { useEffect, useRef, useState } from 'react';
import { connect, sessionId, stompClient } from './WebSocketClient';
import GameBoard from './GameBoard';
import { tileLookup, cardLookup, roadLookup } from './ImageLookup';

function App() {
    const [gameState, setGameState] = useState<any>(null);
    const [connected, setConnected] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [password, setPassword] = useState('');
    const [notification, setNotification] = useState('Enter a player name and the password.');
    const [error, setError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);
    const [joinFailed, setJoinFailed] = useState(false);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [buildingRoad, setBuildingRoad] = useState(false);
    const [buildingSettlement, setBuildingSettlement] = useState(false);
    const [buildingCity, setBuildingCity] = useState(false);
    const [developmentType, setDevelopmentType] = useState<string | null>(null);
    const [trading, setTrading] = useState(-1);
    const [tradingRequested, setTradingRequested] = useState(false);

    const [allChatMessages, setAllChatMessages] = useState<any[]>([]);
    const [privateChatInput, setPrivateChatInput] = useState('');
    const [privateRecipient, setPrivateRecipient] = useState<string>('');

    const colors = ["rgba(0, 0, 211, 0.8)", "rgba(255, 230, 5, 1)", "rgba(255, 132, 0, 0.8)", "rgba(223, 0, 0, 0.8)", "rgba(66, 252, 255, 1)", "rgba(237, 66, 252, 0.8)", "rgb(84, 84, 218)"];
    let playerColors: { [playerId: string]: string } = {};
    const [reactivePlayerColors, setReactivePlayerColors] = useState<{ [playerId: string]: string }>({});

    const chatBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chatBox = chatBoxRef.current;
        if (!chatBox) return;

        // Check if user is near the bottom
        const isAtBottom =
            chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 30;

        if (isAtBottom) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }, [allChatMessages]);

    const [res1, setRes1] = useState(-1);
    const [res2, setRes2] = useState(-1);
    const [give, setGive] = useState([0,0,0,0,0]);
    const [take, setTake] = useState([0,0,0,0,0]);
    const [recipient, setRecipient] = useState<string | null>(null);
    const [activeTrade, setActiveTrade] = useState<any>(null);

    const resourceNames = ["brick", "lumber", "ore", "grain", "wool"];

    const imageCache: { [src: string]: HTMLImageElement } = {};

    function loadCachedImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            if (imageCache[src]) {
                if (imageCache[src].complete) {
                    resolve(imageCache[src]);
                } else {
                    imageCache[src].addEventListener('load', () => resolve(imageCache[src]));
                    imageCache[src].addEventListener('error', reject);
                }
                return;
            }
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
                imageCache[src] = img;
                resolve(img);
            };
            img.onerror = reject;
            imageCache[src] = img;
        });
    }

    const staticBoardRef = useRef<HTMLCanvasElement | null>(null);
    const staticBoardDrawnRef = useRef(false);
    const staticBoardCtxRef = useRef<CanvasRenderingContext2D | null>(null);

    const staticLoadoutRef = useRef<HTMLCanvasElement | null>(null);
    const staticLoadoutDrawnRef = useRef(false);
    const staticLoadoutCtxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Initialize canvases only once
    if (!staticBoardRef.current) {
        staticBoardRef.current = document.createElement('canvas');
        staticBoardRef.current.width = 700;
        staticBoardRef.current.height = 700;
        staticBoardCtxRef.current = staticBoardRef.current.getContext('2d');
    }
    if (!staticLoadoutRef.current) {
        staticLoadoutRef.current = document.createElement('canvas');
        staticLoadoutRef.current.width = 400;
        staticLoadoutRef.current.height = 200;
        staticLoadoutCtxRef.current = staticLoadoutRef.current.getContext('2d');
    }



    // Helper to reset connection state
    const resetConnection = () => {
        setConnected(false);
        setGameState(null);
        setIsMyTurn(false);

        setIsMyTurn(false);
        setBuildingRoad(false);
        setBuildingSettlement(false);
        setBuildingCity(false);
        setDevelopmentType(null);
        setTrading(-1);
        setTradingRequested(false);
    };

    const handleJoin = async () => {
        setJoining(true);
        setError(null);
        setNotification('Attempting to join...');
        setJoinFailed(false);

        connect(
            handleGameUpdate,
            { playerName, password },
            { reconnectDelay: 0 },
            (errorMsg: string) => {
                setJoinFailed(true);
                setError(errorMsg);
                setNotification(errorMsg);
                resetConnection();
                setJoining(false);
            },
            handleChatUpdate,
            handlePrivateChatUpdate,
            handleRequest,
            handleServerNotification,
            handlePrivateUpdate,
            () => {
                setConnected(true);
                setNotification('Joined.');
                setJoining(false);
                playerColors[sessionId ?? "null"] = "rgba(0, 255, 0, 0.8)";
                setReactivePlayerColors(playerColors);
            }
        );
    };

    return (
        
        <div>
            {/* Notification Bar */}
            <div style={{ background: '#eee', padding: '8px', fontSize: '0.9em', borderBottom: '1px solid #ccc', minHeight: 24 }}>
                {notification}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>

            {/* Join Dialog */}
            {!connected && (
                <div style={{
                    margin: '32px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8, width: 320, background: '#fafafa'
                }}>
                    <h3>Join Game</h3>
                    <div>
                        <input
                            type="text"
                            placeholder="Player Name"
                            value={playerName}
                            onChange={e => setPlayerName(e.target.value)}
                            style={{ width: '100%', marginBottom: 8 }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', marginBottom: 8 }}
                        />
                    </div>
                    <button
                        onClick={handleJoin}
                        disabled={joining || !playerName || !password}
                        style={{ width: '100%' }}
                    >
                        {joining ? 'Joining...' :
                            joinFailed ? 'Try Joining Again' : 'Join'}
                    </button>
                    {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
                </div>
            )}

            {/* Game UI */}
            {connected && (
                <GameBoard
                    gameState={gameState}
                    isMyTurn={isMyTurn}
                    handlers={{
                        'onEndTurn' : onEndTurn, 
                        'buildRoad' : buildRoad,
                        'buildSettlement' : buildSettlement,
                        'buildCity' : buildCity,
                        'onClick' : onClick,
                        'onLoadoutClick' : onLoadoutClick,
                        'develop' : develop,
                        'onPropTrade' : propTrade,
                        'onAcceptTrade' : acceptTrade,
                        'onRejectTrade' : rejectTrade,
                        'onOffTrade' : offshoreTrade
                    }}
                    trading={tradingRequested}
                />
            )}

            {/* Sidebar with rules */}
            <aside
                style={{
                    width: 320,
                    minHeight: '50vh',
                    background: '#f7f7f7',
                    borderRight: '1px solid #ddd',
                    padding: 20,
                    fontSize: '0.95em',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',        
                    height: 'calc(100vh - 40px)',
                    maxHeight: 'calc(100vh - 40px)',
            }}>
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        marginBottom: 16,
                        minHeight: 0, // Required for flexbox scrolling
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>How To Play (Quick Reference)</h3>
                    <details open>
                        <summary><b>General Rules</b></summary>
                        <ul>
                            <li>You are green.</li>
                            <li>On your turn, dice are automatically rolled and players collect resources from corresponding adjacent tiles.</li>
                            <li>The goal is to obtain victory points as fast as possible.</li>
                            <li>First to 10 victory points wins (settlement: 1pt, city: 2pt).</li>
                        </ul>
                    </details>
                    <details>
                        <summary><b>Building</b></summary>
                        <ul>
                            <li>Build roads, settlements, or upgrade settlements to cities using resources.</li>
                            <li>Roads are built on edges between tiles. Roads cost 1 Brick and 1 Lumber.</li>
                            <li>Settlements are built on corners between tiles. Settlements cost 1 Brick, 1 Lumber, 1 Wool, and 1 Grain.</li>
                            <li>Cities replace settlements and produce double resources. Cities cost 3 Ore and 2 Grain.</li>
                        </ul>
                    </details>
                    <details>
                        <summary><b>Development Cards</b></summary>
                        <ul>
                            <li>Development Cards are random cards that grant additional abilities.</li>
                            <li>Development Cards cost 1 Ore, 1 Wool, and 1 Grain.</li>
                            <li>There are 5 kinds of Development Cards:</li>
                            <li>Victory Point adds 1 victory point.</li>
                            <li>Knight allows you to block resources from being obtained from a tile.</li>
                            <li>Road-building allows you to build a road for free.</li>
                            <li>Monopoly allows you to take all resources of a specific type from other players.</li>
                            <li>Year of Plenty gives you 2 resources from a type of your choice.</li>
                        </ul>
                    </details>
                    <details>
                        <summary><b>Trading</b></summary>
                        <ul>
                            <li>Trades allow for the exchange of resources.</li>
                            <li>An offshore trade allows the exchange of 2 resource types at a 3:1 rate.</li>
                            <li>Trades between players can be customized with different exchange rates involving multiple resources.</li>
                        </ul>
                    </details>
                    <details>
                        <summary><b>Controls</b></summary>
                        <ul>
                            <li><b>To end your turn</b>, click <b>End Turn</b>.</li>
                            <li><b>To build a road</b>, click <b>Build Road</b> and click on an edge on a tile.</li>
                            <li><b>To build a settlement</b>, click <b>Build Settlement</b> and click on an intersection on the board.</li>
                            <li><b>To upgrade a settlement to a city</b>, click <b>Build City</b> and click on one of your settlements.</li>
                            <li><b>To get a development card</b>, double-click <b>Get Development Card</b> to confirm your purchase and follow the instructions in the notification bar.</li>
                            <li>
                                <b>To make a player-player trade</b>, click <b>Propose a Trade</b>.<br />
                                Click on the resource cards you will give in this trade.<br />
                                The amount of each resource type being traded will be displayed in the bar.<br />
                                You can click multiple times to specify the amount, which will also be displayed in the bar.<br />
                                Click on <b>Propose a Trade</b> (again) to select the resources you will receive.<br />
                                Click on the resource cards you will receive in this trade.<br />
                                Click on <b>Propose a Trade</b> (again) to specify your trading partner.<br />
                                Click on one of the settlements of your intended trading partner.<br />
                                Click on <b>Propose a Trade</b> (again) to send this request.
                            </li>
                            <li><b>To make an offshore trade</b>, click <b>Trade Offshore</b>. Click on the resource card you are exchanging.<br />
                                Click <b>Trade Offshore</b> (again) to confirm.<br />
                                Click on the resource card you are recieving.<br />
                                Click <b>Trade Offshore</b> (again) to make the trade.
                            </li>
                        </ul>
                    </details>
                </div>
                <div
                    style={{
                        borderTop: '1px solid #ccc',
                        paddingTop: 8,
                        background: '#fff',
                    }}
                >
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Chat</div>
                        <div
                            id="chat-messages"
                            ref={chatBoxRef}
                            style={{
                                height: 80,
                                overflowY: 'auto',
                                background: '#f9f9f9',
                                border: '1px solid #eee',
                                borderRadius: 4,
                                marginBottom: 8,
                                padding: 4,
                                fontSize: '0.95em',
                            }}
                        >
                            {allChatMessages.map((msg, i) => (
                                <div key={i}>
                                        <b style={{ color: msg.playerId == sessionId ? 'black' : reactivePlayerColors[msg.playerId] ?? "#222" }}>{gameState?.players[msg.playerId]?.name ?? msg.playerId}:</b>
                                        {(msg.type === 'private' || msg.type === 'mine') && <span style={{ color: 'red' }}>[Private] </span>}
                                        {msg.type === 'mine' && <span style={{ color: reactivePlayerColors[msg.recipientId] ?? 'purple'}}>(to {gameState?.players[msg.recipientId]?.name ?? msg.playerId}) </span>}
                                    {msg.message}
                                </div>
                            ))}
                        </div>
                        <form onSubmit={sendPrivateChat} style={{ marginTop: 4 }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                <select
                                    value={privateRecipient}
                                    onChange={e => setPrivateRecipient(e.target.value)}
                                    style={{ flex: 1, fontSize: '1em', padding: 4 }}
                                    disabled={!gameState || !gameState.players}
                                >
                                    <option value="">Send to all</option>
                                    {gameState && gameState.players && Object.values(gameState.players)
                                        .filter((p: any) => p.playerId !== sessionId)
                                        .map((p: any) => (
                                            <option key={p.playerId} value={p.playerId}>
                                                {p.name}
                                            </option>
                                        ))}
                                </select>
                                <button
                                    type="submit"
                                    style={{ fontSize: '1em', width: 60 }}
                                    disabled={!gameState || !gameState.players}
                                >
                                    Send
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder= {privateRecipient=="" ? "Type a message..." : "Type a private message..."}
                                style={{ width: '100%', fontSize: '1em', padding: 4 }}
                                value={privateChatInput}
                                onChange={e => setPrivateChatInput(e.target.value)}
                                disabled={!gameState || !gameState.players}
                            />
                        </form>
                    </div>
                </aside>
            </div>
        </div>
    );

    async function handleGameUpdate(gameState: any) {
        setGameState(gameState);
        console.log('Game update:', gameState);
        const canvas = document.getElementById('board-canvas') as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (!gameState.board) {
            console.log("Missing board");
        }
        

        if(!staticBoardDrawnRef.current && staticBoardCtxRef.current){

            await loadCachedImage('/assets/tiles/water.png').then(img =>{
                staticBoardCtxRef.current?.drawImage(img, 30, 30, 640, 640);
                ctx.drawImage(img, 30, 30, 640, 640);
            })

            for(let i = 0; i<gameState.board.length; i++){
                const row = gameState.board[i];
                for(let j = 0; j<row.length; j++){

                    const tile = row[j];

                    const x = (j + Math.abs(i-2)*0.5) * 100 + 100;
                    const y = i*100 + 100;
                    
                    loadCachedImage(tileLookup[String(tile.terrain)]).then(img => {
                        if(staticBoardCtxRef.current){
                            staticBoardCtxRef.current.drawImage(img, x, y, 100, 100); 
                            staticBoardCtxRef.current.font = "20px Arial";
                            staticBoardCtxRef.current.fillStyle = "white";
                            staticBoardCtxRef.current.textAlign = "center";
                            staticBoardCtxRef.current.textBaseline = "middle";
                            staticBoardCtxRef.current.fillText(String(tile.hex), x + 50, y + 50);
                        }

                        
                        ctx.drawImage(img, x, y, 100, 100); 
                        ctx.font = "20px Arial";
                        ctx.fillStyle = "white";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(String(tile.hex), x + 50, y + 50);
                    });
                }
            }
        
        }
        
        if(staticBoardDrawnRef.current) ctx.clearRect(0, 0, canvas.width, canvas.height);
        staticBoardDrawnRef.current = true;
        if(staticBoardRef.current) ctx.drawImage(staticBoardRef.current, 0, 0);

        let availableColors = [...colors];

        for(let i = 0; i<gameState.settlements.length; i++){
            const settlement = gameState.settlements[i];
            const getX = (i : number, j : number) => {
                return (j + Math.abs(i-2)*0.5) * 100 + 150;
            }
            const getY = (i : number, j : number) => {
                return i*100 + 150;
            }
            
            // Destructure settlement.adj into x1, y1, x2, y2, x3, y3
            const [ [x1, y1], [x2, y2], [x3, y3] ] = settlement.adj;

            const img = new window.Image();
            img.src = settlement.level<=0 ? '/assets/structures/settlement.png' : '/assets/structures/city.png';

            const x = (getX(x1, y1) 
                                    + getX(x2, y2) 
                                    + getX(x3, y3))/3 - 25;
            const y = (getY(x1, y1) 
                                    + getY(x2, y2) 
                                    + getY(x3, y3))/3 - 25;
            
            console.log("settlement at: " + x + " " + y);

            img.onload = () => {
                    const offCanvas = document.createElement('canvas');
                    offCanvas.width = 50;
                    offCanvas.height = 50;
                    const offCtx = offCanvas.getContext('2d');
                    if (!offCtx) return;

                    offCtx.drawImage(img, 0, 0, 50, 50);

                    offCtx.globalCompositeOperation = "source-atop";
                    if (!playerColors[settlement.owner.playerId]) {
                    playerColors[settlement.owner.playerId] = colors.pop() ?? "rgba(0,0,0,0)";
                    }
                    const color = playerColors[settlement.owner.playerId];
                    setReactivePlayerColors(prev => ({...prev, [settlement.owner.playerId] : color}));
                    offCtx.fillStyle = color;
                    offCtx.fillRect(0, 0, 50, 50);
                    offCtx.globalCompositeOperation = "source-over";

                    ctx.drawImage(offCanvas, x, y, 50, 50);
            }
        }

        for(let i = 0; i<gameState.roads.length; i++){
            const road = gameState.roads[i];
            const getX = (i : number, j : number) => {
                return (j + Math.abs(i-2)*0.5) * 100 + 150;
            }
            const getY = (i : number, j : number) => {
                return i*100 + 150;
            }
            
            const img = new window.Image();

            const [ [x1, y1], [x2, y2] ] = road.adj;

            const x = (getX(x1, y1) 
                                    + getX(x2, y2))/2 - 25;
            const y = (getY(x1, y1) 
                                    + getY(x2, y2))/2 - 25;

            let roadOrientation = 30;

            const dy = getY(x1, y1) - getY(x2, y2);
            const dx = getX(x1, y1) - getX(x2, y2);
            
            if(dy==0){
                roadOrientation = 90;
            } else if(dx/dy < 0){
                roadOrientation = 150;
            }

            img.src = roadLookup[roadOrientation];
            
            img.onload = () => {
                const offCanvas = document.createElement('canvas');
                offCanvas.width = 50;
                offCanvas.height = 50;
                const offCtx = offCanvas.getContext('2d');
                if (!offCtx) return;

                offCtx.drawImage(img, 0, 0, 50, 50);
                offCtx.globalCompositeOperation = "source-atop";

                if (!playerColors[road.owner.playerId]) {
                playerColors[road.owner.playerId] = colors.pop() ?? availableColors.pop() ?? "rgba(0,0,0,0)";
                }
                const color = playerColors[road.owner.playerId];
                setReactivePlayerColors(prev => ({...prev, [road.owner.playerId] : color}));
                
                const colorIndex = availableColors.indexOf(color);
                if (colorIndex !== -1) {
                    availableColors.splice(colorIndex, 1);
                }

                offCtx.fillStyle = color;
                offCtx.fillRect(0, 0, 50, 50);
                offCtx.globalCompositeOperation = "source-over";

                ctx.drawImage(offCanvas, x, y, 50, 50);
            }
        }
    }

    function handleChatUpdate(chatMsg: any) {
        console.log(chatMsg);
        setAllChatMessages(prev => [...prev, { ...chatMsg, type: 'public' }]);
    }

    function handlePrivateChatUpdate(chatMsg: any) {
        if(chatMsg.playerId == sessionId){
            setAllChatMessages(prev => [...prev, { ...chatMsg, type: 'mine' }]);
        } else{
            setAllChatMessages(prev => [...prev, { ...chatMsg, type: 'private' }]);
        }
    }

    function sendPublicChat(e: React.FormEvent) {
        e.preventDefault();
        if (!privateChatInput.trim() || !sessionId) return;
        if (stompClient) {
            stompClient.publish({
                destination: "/app/chat",
                body: JSON.stringify({
                    playerId: sessionId,
                    message: privateChatInput.trim(),
                }),
            });
        }
        setPrivateChatInput('');
    }

    function sendPrivateChat(e: React.FormEvent) {
        e.preventDefault();
        if (!privateChatInput.trim() || !sessionId) return;
        if (privateRecipient === "") {
            // Send as public chat if "Send to all" is selected
            sendPublicChat(e);
            setPrivateChatInput('');
            return;
        }
        if (stompClient) {
            stompClient.publish({
                destination: "/app/privateChat",
                body: JSON.stringify({
                    playerId: sessionId,
                    recipientId: privateRecipient,
                    message: privateChatInput.trim(),
                }),
            });
        }
        setPrivateChatInput('');
    }

    function handleRequest(request: any) {
        console.log(request);

        if (request.message === "move") {
            setIsMyTurn(true);

            if (stompClient && sessionId) {
                const action = {
                    playerId: sessionId,
                    move: "rll"
                };
                stompClient.publish({
                    destination: "/app/action",
                    body: JSON.stringify(action)
                });
            }
            setDevelopmentType(null);
        }

        else if (request.message === "trade"){
            setActiveTrade(request);
            setTradingRequested(true);
        }

        else{
            setBuildingRoad(false);
            setBuildingCity(false);
            setBuildingSettlement(false);
            setTrading(-1);
            if(request.message == "VICTORY_POINT"){
                setNotification("You got an additional victory point.");
                if (stompClient && sessionId) {
                    const action = {
                            playerId: sessionId,
                            move: "devvpt"
                    };
                    stompClient.publish({
                            destination: "/app/action",
                            body: JSON.stringify(action)
                    });
                }
            }
            
            else if(request.message == "KNIGHT"){
                setNotification("You got the knight. Select a tile to block.");
            }

            else if(request.message == "ROAD_BUILDING"){
                setNotification("You get to build a road for free. Select an edge to build a road.");
            }

            else if(request.message == "MONOPOLY"){
                setNotification("You get a monopoly on a resource of your choice. Select a resource from your resources bar.");
            }

            else if(request.message == "YEAR_OF_PLENTY"){
                setNotification("You experience a year of plenty of a resource of your choice. Select a resource from your resources bar.");
            }

            setDevelopmentType(request.message);
            
        }
    }

    function handleServerNotification(msg: any) {
        console.log(msg.message);
        setNotification(msg.message);
    }

    function handlePrivateUpdate(privateUpdate: any) {
        console.log('Private update:', privateUpdate);
        const canvas = document.getElementById('loadout-canvas') as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const res: string[] = ['BRICK','LUMBER','ORE','GRAIN','WOOL'];

        if(!staticLoadoutDrawnRef.current && staticLoadoutCtxRef.current){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for(let i = 0; i<res.length; i++){
                const img = new window.Image();
                img.src = cardLookup[res[i]];

                const x = i * 70;
                const y = 0;
                
                loadCachedImage(cardLookup[res[i]]).then(img => {

                    if(staticLoadoutCtxRef.current)
                        staticLoadoutCtxRef.current.drawImage(img, x, y, 70, 140);
                    ctx.drawImage(img, x, y, 70, 140); 

                    const val = privateUpdate.player.resources && privateUpdate.player.resources[res[i]]
                                                ? privateUpdate.player.resources[res[i]] : 0;

                    ctx.font = "30px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    ctx.lineWidth = 4;
                    ctx.strokeStyle = "white";
                    ctx.strokeText(val, x + 35, y + 70);

                    ctx.fillStyle = val!=0 ? "black" : "red";

                    ctx.fillText(val, x + 35, y + 70);

                })
            }
        }

        if(staticLoadoutDrawnRef.current){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        staticLoadoutDrawnRef.current = true;

        if(staticLoadoutRef.current)
            ctx.drawImage(staticLoadoutRef.current, 0, 0);

        if(staticLoadoutDrawnRef.current){
            for(let i = 0; i<res.length; i++){
                const img = new window.Image();
                img.src = cardLookup[res[i]];

                const x = i * 70;
                const y = 0;
                
                const val = privateUpdate.player.resources && privateUpdate.player.resources[res[i]]
                                            ? privateUpdate.player.resources[res[i]] : 0;
                ctx.font = "30px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.lineWidth = 4;
                ctx.strokeStyle = "white";
                ctx.strokeText(val, x + 35, y + 70);

                ctx.fillStyle = val!=0 ? "black" : "red";

                ctx.fillText(val, x + 35, y + 70);

            }
        }
                

        // Draw points below the resource cards
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = "black";
        ctx.lineWidth = 4;
        ctx.fillText(
            "Points: " + privateUpdate.player.points,
            0,
            140 + 8
        );
    }

    function onEndTurn(){
        if (stompClient && sessionId) {
                const action = {
                        playerId: sessionId,
                        move: "end"
                };
                stompClient.publish({
                        destination: "/app/action",
                        body: JSON.stringify(action)
                });
                setIsMyTurn(false);
        }
    }

    function buildRoad(){
        setBuildingRoad(true); 
        setBuildingCity(false);
        setBuildingSettlement(false);
        setDevelopmentType(null);
        setTrading(-1);
        setNotification("Select an edge to build a road.");
    }

    function buildSettlement(){
        setBuildingSettlement(true);
        setBuildingRoad(false);
        setBuildingCity(false);
        setDevelopmentType(null);
        setTrading(-1);
        setNotification("Select a corner to build a settlement.");
    }

    function buildCity(){
        setBuildingCity(true);
        setBuildingSettlement(false);
        setBuildingRoad(false);
        setDevelopmentType(null);
        setTrading(-1);
        setNotification("Select a settlement to upgrade.");
    }

    function offshoreTrade(){
        setBuildingRoad(false);
        setBuildingCity(false);
        setBuildingSettlement(false);
        setDevelopmentType(null);
        if(trading < 10){
            setTrading(12);
            setNotification("Select a resource to trade away. Press Trade Offshore again to confirm.");
        } else if(trading == 12){
            setTrading(11);
            setNotification("Select a resource to be recieved. Press Trade Offshore again to confirm.");
        } else if(trading == 11){
            const playerMove = "trdoff"+ res1 + res2;
            if (stompClient && sessionId) {
                    const action = {
                            playerId: sessionId,
                            move: playerMove
                    };
                    stompClient.publish({
                            destination: "/app/action",
                            body: JSON.stringify(action)
                    });
            }
            setRes1(-1); setRes2(-1);
            setTrading(-1);
        }
    }

    function acceptTrade(){
        setBuildingRoad(false);
        setBuildingCity(false);
        setBuildingSettlement(false);
        setDevelopmentType(null);
        setTrading(-1);
        setTradingRequested(false);
        if (stompClient && sessionId) {
                stompClient.publish({
                        destination: "/app/trade",
                        body: JSON.stringify(activeTrade)
                });
        }
        setNotification("Trade accepted.");
    }

    function rejectTrade(){
        setBuildingRoad(false);
        setBuildingCity(false);
        setBuildingSettlement(false);
        setDevelopmentType(null);
        setTrading(-1);
        setTradingRequested(false);
        activeTrade.accept = false;
        if (stompClient && sessionId) {
                stompClient.publish({
                        destination: "/app/trade",
                        body: JSON.stringify(activeTrade)
                });
        }
        setNotification("Trade rejected.");
    }
    
    function propTrade(){
        setBuildingRoad(false);
        setBuildingCity(false);
        setBuildingSettlement(false);
        setDevelopmentType(null);
        if(trading < 0){
            setTrading(2);
            setNotification("Select resource(s) to trade away. Press Propose a Trade again when finished.");
        } else if(trading == 2){
            setTrading(1);
            setNotification("Select resource(s) to be recieved. Press Propose a Trade again when finished.");
        } else if(trading == 1){
            setTrading(0);
            setNotification("Select the settlement of the player you would like to trade with.");
        } else if(trading == 0){
            if (stompClient && sessionId) {
                    const trade = {
                            message: "trade",
                            playerId1: sessionId,
                            give: give,
                            playerId2: recipient,
                            take: take,
                            accept: true
                    };
                    stompClient.publish({
                            destination: "/app/trade",
                            body: JSON.stringify(trade)
                    });
            }
            setGive([0, 0, 0, 0, 0]);
            setTake([0, 0, 0, 0, 0]);
            setRecipient(null);
            setTrading(-1);
        }
    }

    function onClick(event: React.MouseEvent<HTMLCanvasElement>){

        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (!(buildingRoad || buildingSettlement || buildingCity || developmentType=="KNIGHT" || developmentType=="ROAD_BUILDING" || trading==0)) return;

        let playerMove = "";
        let sendAction = true;

        if (buildingRoad || buildingSettlement || buildingCity){
            //for building road, find 2 closest tiles
            //for building settlement, find 3 closest tiles

            playerMove += "bld";

            if(buildingRoad){
                playerMove+="rod";
                const coords = getClosestTiles(x, y, 2);
                const [{ i: x1, j: y1 }, { i: x2, j: y2 }] = coords;
                for(let i = 0; i<gameState.roads.length; i++){
                    const road = gameState.roads[i];
                    if(road.adj[0][0] == x1 && road.adj[0][1] == y1 && road.adj[1][0] == x2 && road.adj[1][1] == y2){
                        setNotification("Cannot build over an existing road!");
                        return;
                    }
                }
                playerMove+=""+x1+y1+x2+y2;
            } 
            
            else if(buildingSettlement){
                playerMove+="stl"
                const coords = getClosestTiles(x, y, 3);
                const [{ i: x1, j: y1 }, { i: x2, j: y2 }, { i: x3, j: y3}] = coords;
                for(let i = 0; i<gameState.settlements.length; i++){
                    const settlement = gameState.settlements[i];
                    if(settlement.adj[0][0] == x1 && settlement.adj[0][1] == y1 && settlement.adj[1][0] == x2 && settlement.adj[1][1] == y2){
                        setNotification("Cannot build over an existing settlement!");
                        return;
                    }
                }
                playerMove+=""+x1+y1+x2+y2+x3+y3;
            } 
            
            else if(buildingCity) {
                playerMove+="cty"
                const settlementId = getClosestSettlement(x, y);
                playerMove+=""+settlementId;
            }

        }

        else if(developmentType!=null){
            playerMove+="dev";
            if(developmentType == "KNIGHT"){
                playerMove+="knt";
                const coords = getClosestTiles(x, y, 1);
                const [{ i: x1, j: y1 }] = coords;
                playerMove+=""+x1+y1;
            }

            else if(developmentType == "ROAD_BUILDING"){
                playerMove+="rbd";
                const coords = getClosestTiles(x, y, 2);
                const [{ i: x1, j: y1 }, { i: x2, j: y2 }] = coords;
                for(let i = 0; i<gameState.roads.length; i++){
                    const road = gameState.roads[i];
                    if(road.adj[0][0] == x1 && road.adj[0][1] == y1 && road.adj[1][0] == x2 && road.adj[1][1] == y2){
                        setNotification("Cannot build over an existing road!");
                        return;
                    }
                }
                playerMove+=""+x1+y1+x2+y2;
            }

            setDevelopmentType(null);
        }

        else if(trading==0){
            sendAction = false;
            const settlementId = getClosestOthersSettlement(x, y);
            if(settlementId==-1){
                setNotification("No one to trade with.");
                return;
            }
            const settlementOwner = gameState.settlements[settlementId].owner;
            setRecipient(settlementOwner.playerId);
            setNotification(settlementOwner.name + " selected as trade partner");
        }

        if (stompClient && sessionId && sendAction) {
                const action = {
                        playerId: sessionId,
                        move: playerMove
                };
                stompClient.publish({
                        destination: "/app/action",
                        body: JSON.stringify(action)
                });
        }
    }

    function getClosestTiles(x: number, y: number, n: number){
        let tiles : {i: number, j: number, dist: number}[] = []
        for(let i = -1; i<6; i++){
            for(let j = -1; j<6 - Math.abs(i-2); j++){
                    const tx = (j + Math.abs(i-2)*0.5) * 100 + 150;
                    const ty = i*100 + 150;
                    const dist = Math.hypot(tx-x, ty-y);
                    tiles.push({ i, j, dist })
            }
        }
        tiles.sort((a,b) => a.dist - b.dist);
        tiles = tiles.slice(0, n);
        return tiles.map(({ i, j }) => ({i, j}));
    }

    function getClosestSettlement(x: number, y: number){
        let out = -1;
        let minDist = Infinity;
        for(let i = 0; i<gameState.settlements.length; i++){
            const settlement = gameState.settlements[i];
            const getX = (i : number, j : number) => {
                return (j + Math.abs(i-2)*0.5) * 100 + 150;
            }
            const getY = (i : number, j : number) => {
                return i*100 + 150;
            }

            const [ [x1, y1], [x2, y2], [x3, y3] ] = settlement.adj;

            const sx = (getX(x1, y1) + getX(x2, y2) + getX(x3, y3))/3;
            const sy = (getY(x1, y1) + getY(x2, y2) + getY(x3, y3))/3;

            const dist = Math.hypot(x - sx, y - sy);
            if(settlement.owner.playerId == sessionId && (out == -1 || dist<minDist)){ out = i; minDist = dist; }
        }
        return out;
    }

    function getClosestOthersSettlement(x: number, y: number){
        let out = -1;
        let minDist = Infinity;
        for(let i = 0; i<gameState.settlements.length; i++){
            const settlement = gameState.settlements[i];
            const getX = (i : number, j : number) => {
                return (j + Math.abs(i-2)*0.5) * 100 + 150;
            }
            const getY = (i : number, j : number) => {
                return i*100 + 150;
            }

            const [ [x1, y1], [x2, y2], [x3, y3] ] = settlement.adj;

            const sx = (getX(x1, y1) + getX(x2, y2) + getX(x3, y3))/3;
            const sy = (getY(x1, y1) + getY(x2, y2) + getY(x3, y3))/3;

            const dist = Math.hypot(x - sx, y - sy);
            if(settlement.owner.playerId != sessionId && (out == -1 || dist<minDist)){ out = i; minDist = dist; }
        }
        return out;
    }

    function develop(){
        if (stompClient && sessionId && developmentType == "Y") {
            setDevelopmentType(null);
            const action = {
                    playerId: sessionId,
                    move: 'devget'
            };
            stompClient.publish({
                    destination: "/app/action",
                    body: JSON.stringify(action)
            });
        }

        setNotification("Press again to confirm purchase of a development card.");
        setDevelopmentType("Y");
    }

    function onLoadoutClick(event: React.MouseEvent<HTMLCanvasElement>){

        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (!(developmentType=="MONOPOLY" || developmentType=="YEAR_OF_PLENTY"
            || trading>=0
        )) return;

        let playerMove = "";
        let sendAction = true;

        const resource = Math.max(0, Math.min(4, Math.round((x - 35) / 70)));

        if(developmentType!=null){
            playerMove+="dev";

            if(developmentType == "MONOPOLY"){
                playerMove+="mnp"+resource;
                setNotification("Resource " + resourceNames[resource] + " monopolized.");
            }

            if(developmentType == "YEAR_OF_PLENTY"){
                setNotification("Resource " + resourceNames[resource] + " selected for Year of Plenty.");
                playerMove+="yrp"+resource+resource;
            }

            setDevelopmentType(null);
        }

        else if(trading>=0){

            sendAction = false;
            
            if(trading==12){
                setRes1(resource);
                setNotification("Resource " + resourceNames[resource] + " selected to be given in this trade.");
            }

            else if(trading==11){
                setRes2(resource);
                setNotification("Resource " + resourceNames[resource] + " selected to be given in this trade.");
            }

            else if(trading == 2){
                setGive(prev => {
                    const arr = [...prev];
                    arr[resource]++;
                    setNotification("Amount of " + resourceNames[resource] + " being given in this trade increased to " + arr[resource] + ".");
                    return arr;
                });
                
            }

            else if(trading == 1){
                setTake(prev => {
                    const arr = [...prev];
                    arr[resource]++;
                    setNotification("Amount of " + resourceNames[resource] + " being recieved in the trade increased to " + arr[resource] + ".");
                    return arr;
                });
            }

        }

        if (stompClient && sessionId && sendAction) {
                const action = {
                        playerId: sessionId,
                        move: playerMove
                };
                stompClient.publish({
                        destination: "/app/action",
                        body: JSON.stringify(action)
                });
        }
    }
}

export default App;