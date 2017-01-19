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

        cols.push(type);
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
    return Math.sqrt(Math.pow((b.x-a.x), 2) + Math.pow((b.y-a.y), 2));
  }

  inTiles(tile, tiles) {
    for (let i = 0; i < tiles.length; i++) {
      var t = tiles[i];
      if (t.x == tile.x && t.y == tile.y) {
        return true;
      }
    }
    return false;
  }

  lowestFScore(openNodes) {
    var fScore = 9999;
    var lowestScoreNode;

    for (let i = 0; i < openNodes.length; i++) {
      if (openNodes[i].g < fScore) {
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

    while (openNodes.length > 0) {
      var lowestOpenNodeIndex = this.lowestFScore(openNodes)
console.log(lowestOpenNodeIndex);
      var currentNode = openNodes[lowestOpenNodeIndex];
      var neighborNodes = [];
console.log(currentNode);
      // Remove current node from open nodes
      this.removeNode(currentNode, openNodes);
      closedNodes.push(currentNode);

      if (!(currentNode.x == startX && currentNode.y == startY)) {
        this.setTile(currentNode.x, currentNode.y, "Y");
      }

      // Get valid neighbor nodes
      if ((currentNode.x-1) > -1 && tileMap[currentNode.y][currentNode.x-1] != "#") {
        neighborNodes.push({x: currentNode.x-1, y: currentNode.y});
      }
      if ((currentNode.x+1) < this.state.cols && tileMap[currentNode.y][currentNode.x+1] != "#") {
        neighborNodes.push({x: currentNode.x+1, y: currentNode.y});
      }
      if ((currentNode.y+1) < this.state.rows && tileMap[currentNode.y+1][currentNode.x] != "#") {
        neighborNodes.push({x: currentNode.x, y: currentNode.y+1});
      }
      if ((currentNode.y-1) < -1 && tileMap[currentNode.y-1][currentNode.x] != "#") {
        neighborNodes.push({x: currentNode.x, y: currentNode.y-1});
      }

      console.log("Neighbors: " + neighborNodes.length);

      for (let i = 0; i < neighborNodes.length; i++) {

        var neighborNode = neighborNodes[i];
        neighborNode.rx = currentNode.x;
        neighborNode.ry = currentNode.y;

        if (neighborNode.x == endX && neighborNode.y == endY) {
          // Return reconstruct path
          return true;
        }

        neighborNode.g = currentNode.g + this.distance(currentNode, neighborNode);
        neighborNode.h = this.distance(neighborNode, {x: endX, y: endY});
        neighborNode.f = neighborNode.g + neighborNode.h;

        if (this.inTiles(neighborNode, openNodes)) {
          continue;
        } else if (this.inTiles(neighborNode, closedNodes)) {
          continue;
        } else {
          openNodes.push(neighborNode);
        }
      }
    }
    console.log("DONE");

    return false;
  }

  markPath(tile, startX, startY) {
    if ((tile.rx == startX && tile.y == startY) || (tile.rx == this.state.endPos[0] && tile.y == this.state.endPos[1])) {
      return;
    } else {
      this.setTile(tile.rx, tile.ry, "P");
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
      g: this.distance({
          x: startPos[0],
          y: startPos[1]
        }, {
          x: endPos[0],
          y: endPos[0]
        })
    }];
    var closedNodes = [];
    var lastTile;


    // To-Do: A* stuff
    lastTile = this.calculatePath(this.state.tileMap, openNodes, closedNodes, startPos[0], startPos[1], endPos[0], endPos[1]);

    //this.markPath(lastTile, startPos[0], startPos[1]);

    this.setState({
      rows: rows,
      cols: cols,
      tileMap: this.state.tileMap,
      startPos: startPos,
      endPos: endPos
    });  
  }

  setTile(x, y, type) {
    var tileMap = this.state.tileMap;
    tileMap[y][x] = type;

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
    var type = tileMap[y][x];
    var newType = "B";

    if (type == "B") {
      newType = "#";
      tileMap[y][x] = newType;
    } else if (type == "#") {
      newType = "B";
      tileMap[y][x] = newType;
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