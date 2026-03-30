package com.catan;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.UUID;

@Component
public class IpHandshakeInterceptor implements HandshakeInterceptor {

    private final GameService gameService;

    @Autowired
    public IpHandshakeInterceptor(GameService gameService) {
        this.gameService = gameService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        String password = null;
        if (request instanceof ServletServerHttpRequest servletRequest) {
            var params = servletRequest.getServletRequest().getParameterMap();
            if (params.containsKey("password")) {
                password = params.get("password")[0];
            }
        }

        if (password == null) {
            System.out.println("Connection denied: Missing password.");
            response.setStatusCode(org.springframework.http.HttpStatus.FORBIDDEN);
            return false;
        }

        if (!password.equals(gameService.getGamePassword())) {
            System.out.println("Connection denied: Invalid password " + password + ".");
            response.setStatusCode(org.springframework.http.HttpStatus.FORBIDDEN);
            return false;
        }

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No action needed after the handshake
    }
}