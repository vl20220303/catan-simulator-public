package com.catan.packets;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Message {
    public String playerId;
    public String message;

    // Default constructor (required for JSON deserialization)
    public Message() {}

    public Message(String playerId, String message){
        this.playerId = playerId;
        this.message = message;
    }

    public boolean isClean(){ //checks for valid data
        if(playerId==null) return false;
        if(message==null) return false;
        return true;
    }
}
