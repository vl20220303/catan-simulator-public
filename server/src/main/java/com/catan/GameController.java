package com.catan;

import com.catan.models.GameState;
import com.catan.packets.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Scanner;

@Controller
public class GameController {
    public static final int playerCount = 2;
    private final GameService gameService;
    private final Scanner scan = new Scanner(System.in);
    public GameState gamestate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    // Game initializers
    @PostConstruct
    public void initializeGame() {
        setGamePassword();
        createGame();
        System.out.println("Game set up.");
        try {
            InetAddress localhost = InetAddress.getLocalHost();
            System.out.println("Players can access your game at:\n   " + localhost.getHostAddress().trim() + ":8080");
        } catch (Exception e) {
            System.out.println("Could not find private IP.");
            e.printStackTrace();
        }
    }

    public void setGamePassword() {
        System.out.println("Type a password (1 word, no spaces).");
        String password = scan.next();
        gameService.setGamePassword(password);
        System.out.println("Game password set successfully to " + password);
    }

    public void createGame() {
        System.out.println("Use random board generation? (Y/N)");
        boolean response = scan.next().toUpperCase().contains("Y");
        gamestate = new GameState(response, this);
    }

    @EventListener
    public void addPlayer(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String playerName = headerAccessor.getFirstNativeHeader("playerName");

        if (playerName == null) {
            System.out.println("Player connection attempt without a name.");
            return;
        }
        if (gamestate.players.size() > playerCount) {
            System.out.println("Player cap exceeded.");
            return;
        }
        boolean duplicateName = false;
        for (String s : gamestate.players.keySet()) {
            if (gamestate.players.get(s).name.equals(playerName)) {
                duplicateName = true;
                break;
            }
        }
        if (duplicateName) {
            System.out.println("Player attempt connection with duplicate name " + playerName + " from " + sessionId);
            return;
        }
        new java.util.Timer().schedule(
            new java.util.TimerTask() {
                @Override
                public void run() {
                    // Send sessionId to the player's queue
                    System.out.println("Sending sessionId to /queue/" + playerName);
                    messagingTemplate.convertAndSend("/queue/" + playerName, sessionId);
                    System.out.println("Message sent.");

                    gamestate.addPlayer(sessionId, playerName);
                    System.out.println("Player connected: " + playerName + " (Session ID: " + sessionId + ")");
                    new java.util.Timer().schedule(
                        new java.util.TimerTask() {
                            @Override
                            public void run(){
                                sendPublicUpdate();
                            }
                        }, 
                        500
                    );
                    if (gamestate.players.size() == playerCount) {
                        requestStartGame();
                        return;
                    }
                }
            },
            1000 // 1 second delay to wait for client to subscribe to channel
        );
    }

    @EventListener
    public void removePlayer(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (gamestate.players.containsKey(sessionId)) {
            String playerName = gamestate.players.get(sessionId).name;
            gamestate.remove(sessionId);
            System.out.println("Player disconnected: " + playerName + " (Session ID: " + sessionId + ")");
            sendPublicUpdate();
        } else {
            System.out.println("Unknown session ID disconnected: " + sessionId);
        }
    }

    // Client action handlers
    @MessageMapping("/chat")
    public void handleChatMessage(Message message, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();

        if (sessionId != null) {
            if (!message.isClean()) {
                System.out.println("Invalid message format | Player: " + sessionId);
            }
            sendChatToAll(message);
        } else {
            System.out.println("Null session ID.");
        }
    }

    @MessageMapping("/privateChat")
    public void handlePrivateChatMessage(PrivateMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();

        if (sessionId != null) {
            if (!message.isClean()) {
                System.out.println("Invalid message format | Player: " + sessionId);
            }
            sendChatUpdate(message.recipientId, message);
        } else {
            System.out.println("Null session ID.");
        }
    }

    @MessageMapping("/action")
    public void handlePlayerAction(ClientAction action, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();

        if (sessionId != null) {
            action.playerId = sessionId;
            if (!action.isClean()) {
                System.out.println("Invalid action format | Player: " + sessionId);
            }
            System.out.println("Action received " + action.move);
            boolean moveOn = gamestate.perform(action);
            sendPublicUpdate();
            for (Object s : gamestate.players.keySet().toArray()) {
                sendPrivateUpdate(s.toString());
            }
            if (gamestate.gameEnded){
                gameEnd();
                return;
            }
            if (moveOn) {
                promptAction(gamestate.players.keySet().toArray()[gamestate.currentPlayer].toString());
            }
        } else {
            System.out.println("Null session ID.");
        }
    }

    @MessageMapping("/trade")
    public void handleTrade(Trade trade, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        System.out.println("Trade proposed by " + sessionId);
        if (sessionId != null) {
            gamestate.performTrade(sessionId, trade);
        } else {
            System.out.println("Null session ID.");
        }
    }

    // MessagingTemplate-based broadcasts
    public void sendChatUpdate(String recipientId, Message message) {
        messagingTemplate.convertAndSend("/queue/chat/" + recipientId, message);
        messagingTemplate.convertAndSend("/queue/chat/" + message.playerId, message);
    }

    public void sendChatToAll(Message message) {
        System.out.println("Sending messaage to all");
        messagingTemplate.convertAndSend("/chat/updates", message);
    }

    public void sendPublicUpdate() {
        messagingTemplate.convertAndSend("/topic/updates", new PublicUpdate(gamestate));
    }

    public void sendPrivateUpdate(String playerId) {
        messagingTemplate.convertAndSend("/queue/update/" + playerId, new PrivateUpdate(playerId, gamestate.players.get(playerId)));
    }

    public void promptAction(String playerId) {
        Message msg = new Message(playerId, "move");
        messagingTemplate.convertAndSend("/queue/request/" + playerId, msg);
    }

    public void promptDevelopment(String playerId, String development) {
        Message msg = new Message(playerId, development);
        messagingTemplate.convertAndSend("/queue/request/" + playerId, msg);
    }

    public void promptTrade(String playerId, Trade trade){
        messagingTemplate.convertAndSend("/queue/request/" + playerId, trade);
    }

    public void promptNotif(String playerId, String message) {
        Message msg = new Message(playerId, message);
        messagingTemplate.convertAndSend("/queue/message/" + playerId, msg);
    }

    public void promptToAll(String message) {
        for (Object s : gamestate.players.keySet().toArray()) {
            System.out.println("Sending message to " + s.toString());
            messagingTemplate.convertAndSend("/queue/message/" + s, new Message(s.toString(), message));
        }
    }

    // Server-side methods
    public void requestStartGame() {
        System.out.println("Start game? (Y/N)");
        boolean response = scan.next().contains("Y");
        if(gamestate.players.size() < playerCount){
            System.out.println("Can't start yet, only " + gamestate.players.size() + " people are joined.");
            return;
        }
        if (response) {
            startGame();
        }
    }

    public void startGame() {
        gamestate.currentPlayer = (int) (Math.random() * gamestate.players.size());
        sendPublicUpdate();
        String playerId = gamestate.players.keySet().toArray()[gamestate.currentPlayer].toString();
        System.out.println("Starting game with player " + playerId + ".");
        promptAction(playerId);
        promptNotif(playerId, "Make your moves.");
    }

    public void gameEnd() {
        System.out.println("Start new game? (Y/N)");
        boolean response = scan.next().toUpperCase().contains("Y");
        if (response) {
            initializeGame();
        }
    }
}