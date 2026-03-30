package com.catan.packets;

import java.util.ArrayList;
import java.util.HashMap;

import com.catan.models.*;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PublicUpdate {
    public ArrayList<ArrayList<Tile>> board;
    public ArrayList<Road> roads;
    public ArrayList<Settlement> settlements;
    public HashMap<String, Player> players;

    // Default constructor (required for JSON deserialization)
    public PublicUpdate() {}

    public PublicUpdate(GameState state){
        this.board = state.board;
        this.roads = state.roads;
        this.settlements = state.settlements;
        this.players = state.players;
    }

}