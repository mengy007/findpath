import React, { Component } from 'react';
import Board from './Board';
import './App.css';

class App extends Component {
  constructor() {
    var numRows = 40;
    var numCols = 40;
    
    super();

    var tileMapData = this.genNewTilemap(numRows, numCols);

    this.state = {
      rows: numRows,
      cols: numCols,
      tileMap: tileMapData.tileMap,
      startPos: tileMapData.startPos,
      endPos: tileMapData.endPos
    }
  }

  genNewTilemap(numRows, numCols) {
    var numTiles = numRows * numCols;
    var start = Math.floor(Math.random() * (numTiles / 2))+1;
    var end = Math.floor(Math.random() * (numTiles - (numTiles / 2)) + (numTiles / 2))-1;
    var rows = [];
    var count = 1;
    var startPos;
    var endPos;

    for (let r = 0; r < numRows; r++) {
      var cols = [];

      for (let c = 0; c < numCols; c++) {
        var type = "B";

        if (count == start) {
          type = "S";
          startPos = [c,r];
        } else if (count == end) {
          type = "E";
          endPos = [c,r];
        } else if ((Math.random() * 100) < 30) {
          type = "#";
        }

        cols.push({
          type: type,
          marker: "",
          x: c,
          y: r
        });
        count++;
      }

      rows.push(cols);
    }

    return {
      startPos: startPos,
      endPos: endPos,
      tileMap: rows
    };
  }

  distance(a, b) {
    //return Math.sqrt(Math.pow((b.x-a.x), 2) + Math.pow((b.y-a.y), 2));
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }

  inTiles(tile, tiles) {
    console.log("In Tiles - Checking " + tiles.length + " tiles.");
    for (let i = 0; i < tiles.length; i++) {
      var t = tiles[i];
      if (t.x == tile.x && t.y == tile.y) {
        console.log("Found");
        return true;
      }
    }
    console.log("NOT Found");
    return false;
  }

  lowestFScore(openNodes) {
    var fScore = 9999;
    var lowestScoreNode;

    for (let i = 0; i < openNodes.length; i++) {
      console.log("Checking scores - prev: " + fScore + ", i: " + openNodes[i].f);
      if (openNodes[i].f < fScore) {
        fScore = openNodes[i].f;
        lowestScoreNode = i;
      }
    }

    return lowestScoreNode;
  }

  removeNode(node, nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (node.x == nodes[i].x && node.y == nodes[i].y) {
        nodes.splice(i, 1);
        break;
      }
    }
  }

  calculatePath(tileMap, openNodes, closedNodes, startX, startY, endX, endY) {
    //debug
    var count=0;

    while (openNodes.length > 0) {

      console.log("Open Nodes:");
      for (let i = 0; i < openNodes.length; i++) {
        console.log(openNodes[i].x + "," + openNodes[i].y);
      }

      var lowestOpenNodeIndex = this.lowestFScore(openNodes)
      var currentNode = openNodes[lowestOpenNodeIndex];
      //var currentNode = openNodes.pop();
      var neighborNodes = [];

      console.log("Lowest score: " + currentNode.f + " : " + currentNode.x + "," + currentNode.y);

      // Remove current node from open nodes
      this.removeNode(currentNode, openNodes);
      closedNodes.push(currentNode);

      if (!(currentNode.x == startX && currentNode.y == startY)) {
        this.setTile(currentNode.x, currentNode.y, "Y");
      }

      // Get valid neighbor nodes
      if (((currentNode.x-1) > -1) && tileMap[currentNode.y][currentNode.x-1].type != "#") {
        neighborNodes.push({x: currentNode.x-1, y: currentNode.y});
      }
      if (((currentNode.x+1) < this.state.cols) && tileMap[currentNode.y][currentNode.x+1].type != "#") {
        neighborNodes.push({x: currentNode.x+1, y: currentNode.y});
      }
      if (((currentNode.y+1) < this.state.rows) && tileMap[currentNode.y+1][currentNode.x].type != "#") {
        neighborNodes.push({x: currentNode.x, y: currentNode.y+1});
      }
      if (((currentNode.y-1) > -1) && tileMap[currentNode.y-1][currentNode.x].type != "#") {
        neighborNodes.push({x: currentNode.x, y: currentNode.y-1});
      }

      console.log(neighborNodes.length + " neighbor nodes!");

      for (let i = 0; i < neighborNodes.length; i++) {

        var neighborNode = neighborNodes[i];

        if (this.inTiles(neighborNode, closedNodes)) {
          console.log("Already in closed nodes");
          continue;
        }

        /*
        if (this.inTiles(neighborNode, openNodes)) {
          console.log("Already in open nodes");
          continue;
        }
        */

        neighborNode.rx = currentNode.x;
        neighborNode.ry = currentNode.y;

        this.setTileR(neighborNode, currentNode);

        if (neighborNode.x == endX && neighborNode.y == endY) {
          console.log("Found end: " + neighborNode.x + "," + neighborNode.y);
          this.markPath(neighborNode);
          return currentNode;
        }

        if (!(neighborNode.x == startX && neighborNode.y == startY)) {
          this.setTile(neighborNode.x, neighborNode.y, "O");
        }

        neighborNode.g = currentNode.g + 1;
        neighborNode.f = neighborNode.g + this.distance(neighborNode, {x: endX, y: endY});

        if (this.inTiles(neighborNode, openNodes)) {
          var nodeIndex = this.getNodeIndex(neighborNode, openNodes);
          if (nodeIndex > -1 && openNodes[nodeIndex].f < neighborNode.f) {
            console.log("Skipping: " + neighborNode.x + "," + neighborNode.y);
            continue;
          }
        } else if (this.inTiles(neighborNode, closedNodes)) {
          var nodeIndex = this.getNodeIndex(neighborNode, closedNodes);
          if (nodeIndex > -1 && closedNodes[nodeIndex].f < neighborNode.f) {
            console.log("Skipping: " + neighborNode.x + "," + neighborNode.y);
            continue;
          }
        } else {
          console.log("Adding to openNodes: " + neighborNode.x + "," + neighborNode.y);
          openNodes.push(neighborNode);
        }
      }

      //debug
      if (count++ >= 100) {
        //return;
      }
    }
    console.log("No more open nodes");

    return false;
  }

  getNodeIndex(node, nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (node.x == nodes[i].x && node.y == nodes[i].y) {
        return i;
      }
    }
    return -1;
  }

  setTileR(r, n) {
    var tileMap = this.state.tileMap;

    tileMap[r.y][r.x].rx = n.x;
    tileMap[r.y][r.x].ry = n.y;

    if (r.x < n.x) {
      tileMap[r.y][r.x].marker = "⇨";
    } else if (r.x > n.x) {
      tileMap[r.y][r.x].marker = "⇦";
    } else if (r.y < n.y) {
      tileMap[r.y][r.x].marker = "⇩";
    } else if (r.y > n.y) {
      tileMap[r.y][r.x].marker = "⇧";
    }

    this.setState({
      rows: this.state.rows,
      cols: this.state.cols,
      tileMap: tileMap,
      startPos: this.state.startPos,
      endPos: this.state.endPos
    });
  }

  markPath(tile) {
    console.log("Mark Path: " + tile.rx + "," + tile.ry);

    if (tile.rx == this.state.startPos[0] && tile.y == this.state.startPos[1]) {
      console.log("Mark path done.");
      return;
    } else {
      if (tile.rx > -1 && tile.ry > -1 && this.state.tileMap[tile.ry][tile.rx].type == "Y") {
        console.log("Marking " + tile.rx + "," + tile.ry);
        this.setTile(tile.rx, tile.ry, "P");
        this.markPath(this.state.tileMap[tile.ry][tile.rx]);
      } else {
        console.log("Not marking " + tile.rx + "," + tile.ry + " : " + tile.type);
      }
    }
  }

  findPath(e) {
    var tileMap = this.state.tileMap;
    var rows = this.state.rows;
    var cols = this.state.cols;
    var startPos = this.state.startPos;
    var endPos = this.state.endPos;
    var foundEnd = false;
    var openNodes = [{
      x: startPos[0],
      y: startPos[1],
      f: 0,
      g: this.distance({x: startPos[0], y: startPos[1]}, {x: endPos[0], y: endPos[1]})
    }];
    var closedNodes = [];
    var lastTile;


    // To-Do: A* stuff
    lastTile = this.calculatePath(this.state.tileMap, openNodes, closedNodes, startPos[0], startPos[1], endPos[0], endPos[1]);

    //this.markPath(lastTile);

    this.setState({
      rows: rows,
      cols: cols,
      tileMap: this.state.tileMap,
      startPos: startPos,
      endPos: endPos
    });  
  }

  setTileMarker(x, y, marker) {
    var tileMap = this.state.tileMap;
    tileMap[y][x].marker = marker;

    this.setState({
      rows: this.state.rows,
      cols: this.state.cols,
      tileMap: tileMap,
      startPos: this.state.startPos,
      endPos: this.state.endPos
    });
  }

  setTile(x, y, type) {
    var tileMap = this.state.tileMap;
    tileMap[y][x].type = type;

    this.setState({
      rows: this.state.rows,
      cols: this.state.cols,
      tileMap: tileMap,
      startPos: this.state.startPos,
      endPos: this.state.endPos
    });
  }

  toggleTile(x, y) {
    var tileMap = this.state.tileMap;
    var type = tileMap[y][x].type;
    var newType = "B";

    if (type == "B") {
      newType = "#";
      tileMap[y][x].type = newType;
    } else if (type == "#") {
      newType = "B";
      tileMap[y][x].type = newType;
    }

    this.setState({
      rows: this.state.rows,
      cols: this.state.cols,
      tileMap: tileMap,
      startPos: this.state.startPos,
      endPos: this.state.endPos
    });
  }

  reset(e) {
    var numRows = this.state.rows;
    var numCols = this.state.cols;
    var tileMapData = this.genNewTilemap(numRows, numCols);

    this.setState({
      rows: numRows,
      cols: numCols,
      tileMap: tileMapData.tileMap,
      startPos: tileMapData.startPos,
      endPos: tileMapData.endPos
    });
  }

  render() {
    return (
      <div style={{ padding: "20px" }}>
        <Board rows={this.state.rows} cols={this.state.cols} tileMap={this.state.tileMap} toggleTile={this.toggleTile.bind(this)} />
        <input type="button" value="Find Path" onClick={this.findPath.bind(this)} />
        <input type="button" value="New" onClick={this.reset.bind(this)} />
      </div>
    );
  }
}

export default App;