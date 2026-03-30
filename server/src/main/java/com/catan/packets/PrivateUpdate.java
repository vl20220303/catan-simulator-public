package com.catan.packets;

import com.catan.models.*;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PrivateUpdate {
    public String playerId;
    public Player player;

    // Default constructor (required for JSON deserialization)
    public PrivateUpdate() {}

    public PrivateUpdate(String playerId, Player player){
        this.playerId = playerId;
        this.player = player;
    }

}