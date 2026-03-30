package com.catan;

import org.springframework.stereotype.Service;

@Service
public class GameService {
    private String gamePassword;

    public String getGamePassword() {
        return gamePassword;
    }

    public void setGamePassword(String gamePassword) {
        this.gamePassword = gamePassword;
    }
}