package com.catan.models;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import com.catan.packets.ClientAction;
import com.catan.packets.Trade;
import com.catan.GameController;

public class GameState {
    public final int[][][] defaultBoard = new int[][][]{{{2,10}, {3,2}, {1,9}},
                                                        {{3,12}, {0,6}, {4,4}, {0,10}},
                                                        {{3,9}, {1,11}, {4,1}, {1,3}, {2,8}},
                                                        {{1,8}, {2,3}, {3,4}, {4,5}},
                                                        {{0,5}, {3,6}, {4,11}}};

    public ArrayList<ArrayList<Tile>> board;
    public ArrayList<Road> roads;
    public ArrayList<Settlement> settlements;
    public int currentPlayer;

    public HashMap<String, Player> players;

    private GameController controller;

    public boolean gameEnded = false;


    public GameState(boolean generateBoard, GameController controller){
        players = new HashMap<String, Player>(4);
        this.controller = controller;

        board = new ArrayList<ArrayList<Tile>>(5);
        settlements = new ArrayList<Settlement>();
        roads = new ArrayList<Road>();
        for(int i = 0; i<5; i++){
            board.add(new ArrayList<Tile>(5-Math.abs(i-2)));
        }

        if(!generateBoard){
            for(int i = 0; i<5; i++){
                for(int j = 0; j<(5-Math.abs(i-2)); j++){
                    board.get(i).add(new Tile(defaultBoard[i][j][0], defaultBoard[i][j][1]));
                }
            }
        } else{
            ArrayList<Pair> pairs = new ArrayList<Pair>(19);
            for(int[][] arr : defaultBoard){
                for(int[] pair : arr){
                    pairs.add(new Pair(pair[0], pair[1]));
                }
            }
            java.util.Collections.shuffle(pairs);
            for(int i = 0; i<5; i++){
                for(int j = 0; j<(5-Math.abs(i-2)); j++){
                    Pair p = pairs.remove(0);
                    board.get(i).add(new Tile(p.x, p.y));
                }
            }
        }
    }

    public void remove(String playerId){
        players.remove(playerId);
        for(int i = roads.size()-1; i>=0; i--){
            if(roads.get(i).owner.playerId.equals(playerId)){
                roads.remove(i);
            }
        }
        for(int i = settlements.size()-1; i>=0; i--){
            if(settlements.get(i).owner.playerId.equals(playerId)){
                settlements.remove(i);
            }
        }
    }


    public int roll(int face){
        ArrayList<Pair> rolledTiles = new ArrayList<Pair>();
        for(int i = 0; i<5; i++){
            for(int j = 0; j<(5-Math.abs(i-2)); j++){
                if(board.get(i).get(j).hex == face && !board.get(i).get(j).blocked){
                    rolledTiles.add(new Pair(i, j));
                }
            }
        }

        for(Settlement settlement : settlements){
            for(Pair p : rolledTiles){
                if(settlement.touching(p.x, p.y)){
                    settlement.owner.addResource(board.get(p.x).get(p.y).getResource());
                    if(settlement.level > 0)
                        settlement.owner.addResource(board.get(p.x).get(p.y).getResource());
                }
            }
        }
        return face;
    }

    public int sim(int die, int faces){ //simulates dice roll
        int out = 0;
        for(int i = 0; i<die; i++){
            out+=(int) (1 + Math.random()*faces);
        }
        return out;
    }

    public void addSettlement(Settlement s){
        settlements.add(s);
    }

    public void addRoad(Road r){
        roads.add(r);
    }

    public void addPlayer(String sessionId, String name){
        players.put(sessionId, new Player(sessionId, name));
        // int s = players.size(), x = (s/3)*4, y = ((s+1)%2)*2, xdir = 1 - 2*(s/3);
        // settlements.add(new Settlement(players.get(sessionId), x, y, x + xdir, y, x + xdir, y + 1));
    }

    public boolean connects(int x1, int y1, int x2, int y2, Player P){ //Road connects if it connects with a settlement or if it 
        int cnt = 0;
        for(Road r : roads){
            if(r.owner != P) continue;
            cnt++;
            if(r.touching(x1, y1, x2, y2)) return true;
        }

        for(Settlement s : settlements){
            if(s.owner != P) continue;
            cnt++;
            if(s.touching(x1, y1, x2, y2)) return true;
        }
        
        return false;
    }

    public boolean connects(int x1, int y1, int x2, int y2, int x3, int y3, Player P){ //Settlement connects if it shares 2/3 adjacent tiles with a road
        int cnt = 0;
        for(Road r : roads){
            if(r.owner != P) continue;
            cnt++;
            if(r.touching(x1, y1, x2, y2, x3, y3)) return true;
        }
        return cnt==0;
    }

    public boolean perform(ClientAction action){ //Returns true if turn is ended
        if(!action.playerId.equals(players.keySet().toArray()[currentPlayer].toString())){
            controller.promptNotif(action.playerId, "Wait your turn.");
            return false;
        }

        Player player = players.get(action.playerId);
        String prefix = action.move.substring(0,3);

        // Moves have a 3 character prefix, a 3 character suffix, and appended data.
        // The move format: prefix | suffix | data
        // An example would be "bldrod2332" (prefix = bld, suffix = rod, data = 2332)

                                                                    // Ending a turn
        if(prefix.equals("end")){                       // Looks like end
            if(player.points >= 10){
                controller.promptToAll(player.name + " wins with " + player.points + " points!");
                gameEnded = true;
            }
            currentPlayer = (currentPlayer+1)%players.size();
            return true;
        }

                                                                    // Rolling die (dice roll)
        if(prefix.equals("rll")){                       // Looks like rll
            controller.promptToAll(roll(sim(2,6)) + " rolled.");
            return false;
        }

        String suffix = action.move.substring(3,6);


        if(prefix.equals("bld")){
                                                                    // Building roads
            if(suffix.equals("rod")){                   // Looks like bld|rod|x1|y1|x2|y2 , xi|yi represents an adjacent tile
                int x1 = action.move.charAt(6) - '0';
                int y1 = action.move.charAt(7) - '0';
                int x2 = action.move.charAt(8) - '0';
                int y2 = action.move.charAt(9) - '0';

                if(!player.canBuildRoad()){
                    controller.promptNotif(action.playerId, "Insufficient materials.");
                    return false;
                }
                if(!connects(x1, y1, x2, y2, player)){
                    controller.promptNotif(action.playerId, "Roads must connect to another road or settlement!");
                    return false;
                }

                player.payForRoad();
                addRoad(new Road(player, x1, y1, x2, y2));
                controller.promptNotif(action.playerId, "Road built.");
            }
                                                                    // Building settlements
            if(suffix.equals("stl")){                   // Looks like bld|stl|x1|y1|x2|y2|x3|y3 , xi|yi represents an adjacent tile
                int x1 = action.move.charAt( 6) - '0';
                int y1 = action.move.charAt( 7) - '0';
                int x2 = action.move.charAt( 8) - '0';
                int y2 = action.move.charAt( 9) - '0';
                int x3 = action.move.charAt(10) - '0';
                int y3 = action.move.charAt(11) - '0';

                if(!player.canBuildSettlement()){
                    controller.promptNotif(action.playerId, "Insufficient materials.");
                    return false;
                } 
                if(!connects(x1, y1, x2, y2, x3, y3, player)){
                    controller.promptNotif(action.playerId, "A settlement must connect to a road!");
                    return false;
                }

                player.payForSettlement();
                addSettlement(new Settlement(player, x1, y1, x2, y2, x3, y3));
                controller.promptNotif(action.playerId, "Settlement built.");
            }
                                                                    // Upgrading settlements to cities
            if(suffix.equals("cty")){                   // Looks like bld|cty|x1|y1|x2|y2|x3|y3 , xi|yi represents an adjacent tile
                
                int settlementId = action.move.charAt(6) - '0';

                if(settlements.get(settlementId).level <= 0){
                    if(player.canBuildCity()){
                        player.payForCity();
                        settlements.get(settlementId).upgrade();
                    } else{
                        controller.promptNotif(action.playerId, "Insufficient materials.");
                        return false;
                    }
                } else{
                    controller.promptNotif(action.playerId, "Cannot upgrade this settlment!");
                    return false;
                }
                
                controller.promptNotif(action.playerId, "Settlement upgraded.");
            }
        }
        
        
        if(prefix.equals("dev")){
                                                                    // Getting a development card
            if(suffix.equals("get")){                   // Looks like dev|get
                if(player.canDevelop()){
                    player.payToDevelop();
                    controller.promptDevelopment(action.playerId, Development.Type.createDevelopment().toString());
                } else{
                    controller.promptNotif(action.playerId, "Insufficient funds.");
                    return false;
                }
            }
                                                                    // Playing a Knight
            if(suffix.equals("knt")){                   // Looks like dev|knt|x|y , x|y represents the tile to be blocked
                int x = action.move.charAt(6) - '0';
                int y = action.move.charAt(7) - '0';

                for(ArrayList<Tile> arr : board){
                    for(Tile t : arr){
                        t.blocked = false;
                    }
                }
                board.get(x).get(y).blocked = true;

                controller.promptNotif(action.playerId, "Tile blocked.");
            }
                                                                    // Getting a Victory Point
            if(suffix.equals("vpt")){                   // Looks like dev|vpt                 
                player.points++;
            }
                                                                    // Road-building
            if(suffix.equals("rbd")){                   // Looks like dev|rbd|x1|y1|x2|y2 , xi|yi represents an adjacent tile
                int x1 = action.move.charAt(6) - '0';
                int y1 = action.move.charAt(7) - '0';
                int x2 = action.move.charAt(8) - '0';
                int y2 = action.move.charAt(9) - '0';

                controller.promptNotif(action.playerId, "Road built.");

                roads.add(new Road(player, x1, y1, x2, y2));
            }
                                                                    // Having a Monopoly
            if(suffix.equals("mnp")){                   // Looks like dev|mnp|int, int corresponds with the resource to be taken ( see Tile.asInt() )
                
                Tile.Resource resource = Tile.Resource.toResource(action.move.charAt(6) - '0');

                controller.promptNotif(action.playerId, "Monopoly successful.");

                int sum = 0;
                for(Object o : players.keySet().toArray()){
                    String playerId = o.toString();
                    sum+=players.get(playerId).resources.getOrDefault(resource, 0);
                    players.get(playerId).resources.put(resource, 0);
                }
                player.resources.put(resource, sum);
            }
                                                                    // Having a Year of Plenty
            if(suffix.equals("yrp")){                   // Looks like dev|yrp|int|int, int corresponds with the resource from the deck ( see Tile.asInt() )
                
                Tile.Resource resource1 = Tile.Resource.toResource(action.move.charAt(6) - '0');
                Tile.Resource resource2 = Tile.Resource.toResource(action.move.charAt(7) - '0');

                controller.promptNotif(action.playerId, "Plentiful year achieved.");

                player.resources.put(resource1, player.resources.getOrDefault(resource1, 0) + 1);
                player.resources.put(resource2, player.resources.getOrDefault(resource2, 0) + 1);
            }

        }

        if(prefix.equals("trd")){
                                                                    // Offshore trading in a 3:1 ratio
            if(suffix.equals("off")){                                   // Looks like trd|off|int|int, where the int1 corresponds with resource to be traded, int3 corresponds with the resource to be recieved

                Tile.Resource resourceGive = Tile.Resource.toResource(action.move.charAt(6) - '0');
                Tile.Resource resourceGet = Tile.Resource.toResource(action.move.charAt(7) - '0');

                int amtOfGive = player.resources.getOrDefault(resourceGive, 0);

                if(amtOfGive < 3){
                    controller.promptNotif(action.playerId, "You don't have enough resources to make this trade.");
                    return false;
                }

                controller.promptNotif(action.playerId, "Trade successful.");
                player.resources.put(resourceGive, amtOfGive-3);
                player.resources.put(resourceGet, player.resources.getOrDefault(resourceGet, 0) + 1);

            }

        }

        return false;
    }

    public Trade openTrade = null;

    public void performTrade(String playerId, Trade t){
        if(openTrade == null || !players.containsKey(openTrade.playerId1) || !players.containsKey(openTrade.playerId2)){
            if(!playerId.equals(t.playerId1)){
                System.out.println("Malformed trade request from " + playerId);
                return;
            }

            for(int i = 0; i<5; i++){
                if(players.get(playerId).resources.getOrDefault(Tile.Resource.toResource(i), 0) < t.give[i] ){
                    controller.promptNotif(playerId, "You don't have enough resources to execute this trade.");
                    return;
                }
            }

            openTrade = t;

            controller.promptNotif(t.playerId2, "Player " + players.get(t.playerId1).name + " wants to trade " + Arrays.toString(t.give) + " for " + Arrays.toString(t.take) + " [brick,lumber,ore,grain,wool] , respectively.");
            controller.promptTrade(t.playerId2, t);
        }

        else{

            if(!playerId.equals(t.playerId2)){
                System.out.println("Malformed trade request from " + playerId);
                return;
            }

            if(!openTrade.equals(t)){
                System.out.println("Invalid trade request from " + playerId);
                return;
            }

            if(!t.accept){
                controller.promptNotif(t.playerId1, "Player " + players.get(t.playerId2).name + " rejected your trade offer.");
                openTrade = null;
                return;
            }

            for(int i = 0; i<5; i++){
                if(players.get(playerId).resources.getOrDefault(Tile.Resource.toResource(i), 0) < t.take[i] ){
                    controller.promptNotif(playerId, "You don't have enough resources to accept this trade.");
                    controller.promptNotif(t.playerId1, "Player " + players.get(t.playerId2).name + " rejected your trade offer.");
                    openTrade = null;
                    return;
                }
            }

            Player p1 = players.get(t.playerId1);
            Player p2 = players.get(t.playerId2);

            for(int i = 0; i<5; i++){
                Tile.Resource R = Tile.Resource.toResource(i);
                p1.resources.put(R, p1.resources.getOrDefault(R,0) - t.give[i]);
                p2.resources.put(R, p2.resources.getOrDefault(R,0) + t.give[i]);
            }

            for(int i = 0; i<5; i++){
                Tile.Resource R = Tile.Resource.toResource(i);
                p1.resources.put(R, p1.resources.getOrDefault(R,0) + t.take[i]);
                p2.resources.put(R, p2.resources.getOrDefault(R, 0) - t.take[i]);
            }

            controller.promptNotif(t.playerId1, "Trade successful.");
            controller.promptNotif(t.playerId2, "Trade successful.");
            controller.sendPrivateUpdate(t.playerId1);
            controller.sendPrivateUpdate(t.playerId2);

            openTrade = null;

        }
    }
}