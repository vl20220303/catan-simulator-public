package com.catan.models;

public class Settlement {
    public int[][] adj; //A road is the edge between 2 distinct tiles
    public Player owner;
    public int level;

    public Settlement(Player owner, int x1, int y1, int x2, int y2, int x3, int y3){
        this.owner = owner;
        this.level = 0;
        this.adj = new int[3][2];
        adj[0] = new int[]{x1, y1};
        adj[1] = new int[]{x2, y2};
        adj[2] = new int[]{x3, y3};
    }

    public boolean touching(int x, int y){
        return (adj[0][0] == x && adj[0][1] == y) || 
               (adj[1][0] == x && adj[1][1] == y) ||
               (adj[2][0] == x && adj[2][1] == y);
    }

    public void upgrade(){
        level++;
    }

    public boolean touching(int x1, int y1, int x2, int y2){
        Pair[] coords = new Pair[]{new Pair(x1, y1), new Pair(x2, y2)};
        Pair p1 = new Pair(this.adj[0][0], this.adj[0][1]);
        Pair p2 = new Pair(this.adj[1][0], this.adj[1][1]);
        Pair p3 = new Pair(this.adj[2][0], this.adj[2][1]);
        int match = 0;
        for(Pair p : coords){
            if(p.equals(p1) || p.equals(p2) || p.equals(p3)) match++;
        }
        return match >= 2;
    }
}
