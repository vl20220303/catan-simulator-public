package com.catan.models;

public class Pair {
    int x, y;
    public Pair(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public boolean equals(Pair p){
        return this.x == p.x && this.y == p.y;
    }
}
