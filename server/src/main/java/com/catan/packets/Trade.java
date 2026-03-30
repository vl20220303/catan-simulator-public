package com.catan.packets;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Trade {
    public String message, playerId1, playerId2;
    public int[] give, take;
    public boolean accept;


    // Default constructor (required for JSON deserialization)
    public Trade() {}

    public Trade(String playerId1, int[] give, String playerId2, int[] take, boolean accept){
        this.message = "trade";
        this.playerId1 = playerId1;
        this.playerId2 = playerId2;
        this.give = give;
        this.take = take;
        this.accept = accept;
    }

    public boolean equals(Trade t){
        return 
        (this.playerId1.equals(t.playerId1)) && (this.playerId2.equals(t.playerId2))
        &&
        (Arrays.equals(this.give, t.give)) && (Arrays.equals(this.take, t.take));
    }

}