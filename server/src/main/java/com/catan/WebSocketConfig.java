package com.catan;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final IpHandshakeInterceptor ipHandshakeInterceptor;

    public WebSocketConfig(IpHandshakeInterceptor ipHandshakeInterceptor) {
        this.ipHandshakeInterceptor = ipHandshakeInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue", "/user", "/chat"); // for sending messages to clients
        config.setUserDestinationPrefix("/user");
        config.setApplicationDestinationPrefixes("/app"); // for receiving from clients
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // match frontend
                .addInterceptors(ipHandshakeInterceptor) // Register the interceptor
                .withSockJS();
    }
}