package com.catan.packets;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClientAction {
    public String playerId;
    public String move;

    // Default constructor (required for JSON deserialization)
    public ClientAction() {}

    public ClientAction(String playerId, String move){
        this.playerId = playerId;
        this.move = move;
    }

    public boolean isClean(){ //checks for valid data
        if(playerId==null) return false;
        if(move==null) return false;
        return true;
    }
}
