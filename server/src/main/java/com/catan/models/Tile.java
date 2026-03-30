package com.catan.models;

public class Tile {
    public enum Resource {
        BRICK, LUMBER, ORE, GRAIN, WOOL;
        public int asInt() {
            switch (this) {
            case BRICK: return 0;
            case LUMBER: return 1;
            case ORE: return 2;
            case GRAIN: return 3;
            case WOOL: return 4;
            default: throw new IllegalArgumentException("Unknown resource");
            }
        }
        public static Resource toResource(int i) {
            switch (i) {
            case 0: return BRICK;
            case 1: return LUMBER;
            case 2: return ORE;
            case 3: return GRAIN;
            case 4: return WOOL;
            default: throw new IllegalArgumentException("Invalid resource integer: " + i);
            }
        }
    }

    public enum Terrain {
        HILLS, FOREST, MOUNTAINS, FIELDS, PASTURE, DESERT;
        public int asInt() {
            switch (this) {
            case HILLS: return 0;
            case FOREST: return 1;
            case MOUNTAINS: return 2;
            case FIELDS: return 3;
            case PASTURE: return 4;
            case DESERT: return 5;
            default: throw new IllegalArgumentException("Unknown terrain");
            }
        }
        public static Terrain toTerrain(int i) {
            switch (i) {
            case 0: return HILLS;
            case 1: return FOREST;
            case 2: return MOUNTAINS;
            case 3: return FIELDS;
            case 4: return PASTURE;
            case 5: return DESERT;
            default: throw new IllegalArgumentException("Invalid terrain integer: " + i);
            }
        }
    }

    public Terrain terrain;
    public int hex;
    public boolean blocked;

    public Tile(int terrain, int hex){
        this.terrain = Terrain.toTerrain(terrain);
        this.hex = hex;
    }

    public Resource getResource(){
        return Resource.toResource(this.terrain.asInt());
    }
}
