package com.catan.models;
import java.util.ArrayList;
import java.util.HashMap;

public class Player {
    public String playerId;
    public String name;
    public HashMap<Tile.Resource, Integer> resources;
    public int points;
    
    public Player(String playerId, String name){
        this.playerId = playerId;
        this.name = name;
        resources = new HashMap<Tile.Resource, Integer>(5);
        points = 0;
        for(int i = 0; i<2; i++){
            addResource(Tile.Resource.BRICK);
            addResource(Tile.Resource.LUMBER);
        }
        for(int i = 0; i<2; i++){
            addResource(Tile.Resource.BRICK);
            addResource(Tile.Resource.LUMBER);
            addResource(Tile.Resource.WOOL);
            addResource(Tile.Resource.GRAIN);
        }
    }

    public void addResource(Tile.Resource r){
        resources.put(r, resources.getOrDefault(r,0)+1);
    }

    public boolean canBuildRoad(){
        int brickAmt = resources.getOrDefault(Tile.Resource.BRICK, 0);
        int lumberAmt = resources.getOrDefault(Tile.Resource.LUMBER, 0);
        return brickAmt > 0 && lumberAmt > 0;
    }
    public void payForRoad(){
        resources.put(Tile.Resource.BRICK, resources.getOrDefault(Tile.Resource.BRICK, 0) - 1);
        resources.put(Tile.Resource.LUMBER, resources.getOrDefault(Tile.Resource.LUMBER, 0) - 1); 
    }

    public boolean canBuildSettlement(){
        int brickAmt = resources.getOrDefault(Tile.Resource.BRICK, 0);
        int lumberAmt = resources.getOrDefault(Tile.Resource.LUMBER, 0);
        int woolAmt = resources.getOrDefault(Tile.Resource.WOOL, 0);
        int grainAmt = resources.getOrDefault(Tile.Resource.GRAIN, 0);
        return brickAmt > 0 && lumberAmt > 0 && woolAmt > 0 && grainAmt > 0;
    }

    public void payForSettlement(){
        resources.put(Tile.Resource.BRICK, resources.getOrDefault(Tile.Resource.BRICK, 0) - 1);
        resources.put(Tile.Resource.LUMBER, resources.getOrDefault(Tile.Resource.LUMBER, 0) - 1);
        resources.put(Tile.Resource.WOOL, resources.getOrDefault(Tile.Resource.WOOL, 0) - 1);
        resources.put(Tile.Resource.GRAIN, resources.getOrDefault(Tile.Resource.GRAIN, 0) - 1);
        points++;
    }

    public boolean canBuildCity(){
        int oreAmt = resources.getOrDefault(Tile.Resource.ORE, 0);
        int grainAmt = resources.getOrDefault(Tile.Resource.GRAIN, 0);
        return oreAmt > 2 && grainAmt > 1;
    }

    public void payForCity(){
        resources.put(Tile.Resource.ORE, resources.getOrDefault(Tile.Resource.ORE, 0) - 3);
        resources.put(Tile.Resource.GRAIN, resources.getOrDefault(Tile.Resource.GRAIN, 0) - 2);
        points+=2;
    }

    public boolean canDevelop(){
        int oreAmt = resources.getOrDefault(Tile.Resource.ORE, 0);
        int woolAmt = resources.getOrDefault(Tile.Resource.WOOL, 0);
        int grainAmt = resources.getOrDefault(Tile.Resource.GRAIN, 0);
        return oreAmt > 0 && woolAmt > 0 && grainAmt > 0;
    }

    public void payToDevelop(){
        resources.put(Tile.Resource.ORE, resources.getOrDefault(Tile.Resource.ORE, 0) - 1);
        resources.put(Tile.Resource.WOOL, resources.getOrDefault(Tile.Resource.WOOL, 0) - 1);
        resources.put(Tile.Resource.GRAIN, resources.getOrDefault(Tile.Resource.GRAIN, 0) - 1);
    }

}