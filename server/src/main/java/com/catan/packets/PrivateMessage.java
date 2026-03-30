package com.catan.packets;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PrivateMessage extends Message {
    public String recipientId;

    // Default constructor (required for JSON deserialization)
    public PrivateMessage() {}

    public PrivateMessage(String playerId, String message, String recipient){
        super(playerId, message);
        this.recipientId = recipient;
    }

    public boolean isClean(){ //checks for valid data
        return super.isClean() && recipientId!=null && recipientId.length()>0;
    }
}
