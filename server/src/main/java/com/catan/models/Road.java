package com.catan.models;

public class Road {
    public int[][] adj; //A road is the edge between 2 distinct tiles
    public Player owner;

    public Road(Player owner, int x1, int y1, int x2, int y2){
        this.owner = owner;
        adj = new int[2][2];
        adj[0] = new int[]{x1, y1};
        adj[1] = new int[]{x2, y2};
    }

    public boolean touching(int x, int y){
        return (adj[0][0] == x && adj[0][1] == y) || (adj[1][0] == x && adj[1][1] == y);
    }

    public boolean touching(int x1, int y1, int x2, int y2, int x3, int y3){
        Pair[] coords = new Pair[]{new Pair(x1, y1), new Pair(x2, y2), new Pair(x3, y3)};
        Pair p1 = new Pair(this.adj[0][0], this.adj[0][1]);
        Pair p2 = new Pair(this.adj[1][0], this.adj[1][1]);
        int match = 0;
        for(Pair p : coords){
            if(p.equals(p1) || p.equals(p2)) match++;
        }
        return match >= 2;
    }

    public boolean touching(int x1, int y1, int x2, int y2){
        Pair[] coords = new Pair[]{new Pair(x1, y1), new Pair(x2, y2)};
        Pair p1 = new Pair(this.adj[0][0], this.adj[0][1]);
        Pair p2 = new Pair(this.adj[1][0], this.adj[1][1]);
        boolean flag = true;
        Pair intersect = new Pair(-1, -1);
        for(Pair p : coords){
            if(p.equals(p1) || p.equals(p2)){ intersect = p; flag = true; break;}
        }

        if(!flag) return false;

        return !(intersect.x == (p1.x + p2.x + x1 + x2 - intersect.x)/3.0 && intersect.y == (p1.y + p2.y + y1 + y2 - intersect.y)/3.0);
    }
}
