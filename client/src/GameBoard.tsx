import React from 'react';

interface GameBoardProps {
    gameState: any;
    isMyTurn: boolean;
    handlers: {
        'onEndTurn' : () => void, 
        'buildRoad' : () => void,
        'buildSettlement' : () => void,
        'buildCity' : () => void,
        'onClick' : (event: React.MouseEvent<HTMLCanvasElement>) => void,
        'onLoadoutClick' : (event: React.MouseEvent<HTMLCanvasElement>) => void,
        'develop' : () => void;
        'onPropTrade' : () => void;
        'onAcceptTrade' : () => void;
        'onRejectTrade' : () => void;
        'onOffTrade' : () => void
    }
    trading: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, isMyTurn, handlers, trading }) => (
    <div style={{ margin: '8px auto', maxWidth: 900 }}>
        {/* Board Canvas */}
        <canvas id="board-canvas" width={700} height={700} style={{ display: 'block', margin: '0 auto 16px' }}
            onClick={handlers['onClick']} />
        {/* Player Loadout and Controls */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <canvas id="loadout-canvas" width={400} height={200} onClick={handlers['onLoadoutClick']}/>
            <div>
                <button 
                    style={{ display: 'block', marginBottom: 16, width: 120 }} 
                    disabled={!isMyTurn}
                    onClick={handlers['onEndTurn']}
                    >End Turn</button>
                <div>
                    <button 
                        style={{ width: 120, marginBottom: 16 }} 
                        disabled={!isMyTurn}
                        onClick={handlers['buildRoad']}
                        >Build Road</button>

                    <button 
                        style={{ width: 120, marginBottom: 16 }} 
                        disabled={!isMyTurn}
                        onClick={handlers['buildSettlement']}
                        >Build Settlement</button>
                    <button 
                        style={{ width: 120 }} 
                        disabled={!isMyTurn}
                        onClick={handlers['buildCity']}
                        >Build City</button>
                </div>

                <button 
                    style={{ display: 'block', marginBottom: 16, width: 120 }} 
                    disabled={!isMyTurn}
                    onClick={handlers['develop']}
                    >Get Development Card</button>
                <div style={{ display: 'flex', marginBottom: 16 }}>
                    <button 
                        style={{ width: 120 }} 
                        disabled={!isMyTurn}
                        onClick={handlers['onPropTrade']}
                        >Propose a Trade</button>
                    <button 
                        style={{ width: 120 }} 
                        disabled={!trading}
                        onClick={handlers['onAcceptTrade']}
                        >Accept Trade</button>
                    <button 
                        style={{ width: 120 }} 
                        disabled={!trading}
                        onClick={handlers['onRejectTrade']}
                        >Reject Trade</button>
                </div>
                <button 
                    style={{ display: 'block', marginBottom: 16, width: 120 }} 
                    disabled={!isMyTurn}
                    onClick={handlers['onOffTrade']}
                    >Trade Offshore</button>
            </div>
        </div>
    </div>

);

export default GameBoard;