package com.catan.models;

public class Development{
    public enum Type{
        KNIGHT, VICTORY_POINT, ROAD_BUILDING, MONOPOLY, YEAR_OF_PLENTY;
        public static Development.Type createDevelopment(int i){
            switch(i){
                case 0: return Type.KNIGHT;
                case 1: return Type.VICTORY_POINT;
                case 2: return Type.ROAD_BUILDING;
                case 3: return Type.MONOPOLY;
                case 4: return Type.YEAR_OF_PLENTY;
                default: throw new IllegalArgumentException("Unknown resource");
            }
        }

        public static Development.Type createDevelopment(){
            return createDevelopment((int) (Math.random()*5));

        }
    }

    public Type type;

    public Development(Type type){
        this.type = type;
    }
    
}
