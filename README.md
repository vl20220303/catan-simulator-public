# Before you start
## Security Concerns
Hosting the multiplayer function of this game requires you to open your web server to users on your network. <br>
Failure to take necessary safety precautions may result in unwanted access to your system. Therefore, before hosting, <br><br>
**Ensure port forwarding is disabled on your network.** <br>
This will ensure your computer is not visible to the outside world. <br><br>
**Try to use a secure and trusted network.** <br>
All users on your network, including malicious actors, will be able to see and interact with your computer. <br><br>
**Check your firewall settings.** <br>
You can add or remove trusted devices to restrict access to people you trust. <br>
# Setup
Hosting the game is simple. It is assumed you (the host) have JDK 17+ installed.<br><br>
Download catan-simulator.zip and extract to a folder of your choice.<br><br>
Navigate to the `server` folder.<br><br>
Open and run `server/CatanBackendApplication.java`.<br><br>
You will subsequently be prompted to set a password and configure other game settings.<br><br>
Once setup is completed, the access link will be displayed via a printout to the terminal.<br><br>
As the game communicates via port `8080`, you will need to configure your firewall to allow requests to this port.<br>
It is wise to keep other ports disabled unless explicitly needed to prevent unauthorized access to your machine. <br><br>
Once 4 players have joined, you will be prompted to start the game.<br>
# Gameplay
Enter the access link provided by the host in your browser. In order for you to connect to the game, you must be on the same network as the host.<br><br>
Then, enter your name and the game password (as set by the host). If you have an incorrect password or a missing or duplicate player name, you will be unable to join. You may need to refresh your page to join again.<br><br>
Once you are in the game, you will be able to see the game board. You will be able to play once the host starts the game.<br>
## You play as the green player.
- On each turn, dice are rolled automatically, and players collect resources from adjacent tiles.
- You can build roads, settlements, or upgrade settlements into cities using resources.<br>
## Building Costs
- Roads are placed on the edges between tiles and require 1 Brick and 1 Lumber.
- Settlements are built on tile corners and cost 1 Brick, 1 Lumber, 1 Wool, and 1 Grain.
- Cities replace settlements, producing double resources, and cost 3 Ore and 2 Grain.
- Roads must be built connected to settlements, and vice versa, with the exception of the first 2 settlements, which can be built anywhere without touching each other or connecting via a road.<br>
## Development Cards
Development cards grant special abilities and cost 1 Ore, 1 Wool, and 1 Grain. There are five types:
- `Victory Point` – Adds 1 victory point.
- `Knight` – Blocks resource collection from a tile.
- `Road-Building` – Grants a free road.
- `Monopoly` – Lets you take all resources of a specific type from other players.
- `Year of Plenty` – Gives you two resources of your choice.<br>
## Making Trades
Trades allow for the exchange of resources.
- An offshore trade allows the exchange of 2 resource types, at a 3:1 rate, eg. a player can trade 3 lumber for 1 ore in return.
- Trades between players can be customized with different exchange rates involving multiple resources, eg. a player can trade 1 brick, 1 lumber, and 2 grain for 2 ore and 1 wool in return.
## Winning the Game
The objective is to reach 10 victory points as quickly as possible.
- Settlements give 1 point each.
- Upgrading to cities give an additional 2 points each.
- The first player to 10 points wins the game.
