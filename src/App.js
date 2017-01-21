import React, { Component } from 'react';
import Board from './Board';
import './App.css';

class App extends Component {
  constructor() {
    var numRows = 40;
    var numCols = 71;
    
    super();

    var tileMapData = this.genNewTilemap(numRows, numCols);

    this.state = {
      rows: numRows,
      cols: numCols,
      tileMap: tileMapData.tileMap,
      startPos: tileMapData.startPos,
      endPos: tileMapData.endPos,
      status: "Click 'Find Path', 'New' or on the map to add and remove walls."
    }
  }

  genMaze(e) {
    var numRows = this.state.rows;
    var numCols = this.state.cols;
    var x = Math.floor(Math.random() * numCols);
    var y = Math.floor(Math.random() * numRows);
    var cells = [];

    //Fill with walls
    this.fillWalls(null);

    var tileMap = this.state.tileMap;

    var count = 0;

    cells.push({x: x, y: y});

    console.log("Cells: " + cells.length);

    this.setTile(x, y, "B");

    while (cells.length > 0) {
      var index = Math.floor(Math.random() * cells.length);
      var x = cells[index].x;
      var y = cells[index].y;
      var dirs = [];

      dirs.push({x: x-2, y: y}); // Left
      dirs.push({x: x+2, y: y}); // Right
      dirs.push({x: x, y: y-2}); // Up
      dirs.push({x: x, y: y+2}); // Down

      while (index > -1 && dirs.length > 0) {
        var dirIndex = Math.floor(Math.random() * dirs.length);
        var dir = dirs[dirIndex];

        if (dir.x >= 0 && dir.y >= 0 && dir.x < numCols && dir.y < numRows && (tileMap[dir.y][dir.x].type == "#" || tileMap[dir.y][dir.x].type == "S" || tileMap[dir.y][dir.x].type == "E" )) {
          if (dir.x < x) {
            tileMap[y][x].type = "B";
            tileMap[y][x-1].type = "B";
            tileMap[y][x-2].type = "B";
          } else if (dir.x > x) {
            tileMap[y][x].type = "B";
            tileMap[y][x+1].type = "B";
            tileMap[y][x+2].type = "B";
          } else if (dir.y < y) {
            tileMap[y][x].type = "B";
            tileMap[y-1][x].type = "B";
            tileMap[y-2][x].type = "B";
          } else if (dir.y > y) {
            tileMap[y][x].type = "B";
            tileMap[y+1][x].type = "B";
            tileMap[y+2][x].type = "B";
          }

          // Add neighbor to list
          cells.push({x: dir.x, y: dir.y});

          index = -1;
        }

        dirs.splice(dirIndex, 1);
      }

      //cells.splice(index, 1);

      tileMap[this.state.startPos[1]][this.state.startPos[0]].type = "S";
      tileMap[this.state.endPos[1]][this.state.endPos[0]].type = "E";

      if (count++ >= 20000) {
        break;
      }
    }

    console.log("Done genMaze");

    this.setState({
      tileMap: tileMap
    });
  }

  clearPath(e) {
    var tileMap = this.state.tileMap;

    for (let r = 0; r < this.state.rows; r++) {
      for (let c = 0; c < this.state.cols; c++) {
        var tile = tileMap[r][c];
        if (tile.type != "S" && tile.type != "E" && tile.type != "#") {
          tileMap[r][c].type = "B";
          tileMap[r][c].marker = "";
        }
      }
    }

    this.setState({
      tileMap: tileMap
    });
  }

  fillTiles(type) {
    var tileMap = this.state.tileMap;

    for (let r = 0; r < this.state.rows; r++) {
      for (let c = 0; c < this.state.cols; c++) {
        var tile = tileMap[r][c];
        if (tile.type != "S" && tile.type != "E") {
          tileMap[r][c].type = type;
          tileMap[r][c].marker = "";
        }
      }
    }

    this.setState({
      tileMap: tileMap
    });
  }

  clearTiles(e) {
    this.fillTiles("B");
  }

  fillWalls(e) {
    this.fillTiles("#");
  }

  genNewTilemap(numRows, numCols) {
    var numTiles = numRows * numCols;
    var start = Math.floor(Math.random() * (numTiles/10));
    var end = Math.floor(Math.random() * (numTiles / 10)) + (numTiles - (numTiles / 10))-1;
    var rows = [];
    var count = 1;
    var startPos;
    var endPos;

    for (let r = 0; r < numRows; r++) {
      var cols = [];
      var prevType = "B";

      for (let c = 0; c < numCols; c++) {
        var type = "B";

        if (count == start) {
          type = "S";
          startPos = [c,r];
        } else if (count == end) {
          type = "E";
          endPos = [c,r];
        } else {
          var chanceForWall = 20;

          if (prevType == "#") {
            chanceForWall = 60;
          }

          if ((Math.random() * 100) < chanceForWall) {
            type = "#";
            prevType = "#";
          } else {
            prevType = "B";
          }
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
    var fScore = Infinity;
    var lowestScoreNode;

    for (let i = 0; i < openNodes.length; i++) {
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

    this.setState({
      status: "Searching..."
    });

    while (openNodes.length > 0) {
      var lowestOpenNodeIndex = this.lowestFScore(openNodes)
      var currentNode = openNodes[lowestOpenNodeIndex];
      var neighborNodes = [];

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

      for (let i = 0; i < neighborNodes.length; i++) {

        var neighborNode = neighborNodes[i];

        if (this.inTiles(neighborNode, closedNodes)) {
          continue;
        }

        neighborNode.rx = currentNode.x;
        neighborNode.ry = currentNode.y;

        this.setTileR(neighborNode, currentNode);

        if (neighborNode.x == endX && neighborNode.y == endY) {
          this.setState({
            status: "Path found!"
          });
          this.markPath(neighborNode);
          return currentNode;
        }

        if (!(neighborNode.x == startX && neighborNode.y == startY)) {
          this.setTile(neighborNode.x, neighborNode.y, "O");
        }

        neighborNode.g = currentNode.g + 1;
        neighborNode.f = neighborNode.g + this.distance(neighborNode, {x: endX, y: endY});

        this.setTileScore(neighborNode.x, neighborNode.y, neighborNode.f);

        if (this.inTiles(neighborNode, openNodes)) {
          var nodeIndex = this.getNodeIndex(neighborNode, openNodes);
          if (nodeIndex > -1 && openNodes[nodeIndex].f < neighborNode.f) {
            continue;
          }
        } else if (this.inTiles(neighborNode, closedNodes)) {
          var nodeIndex = this.getNodeIndex(neighborNode, closedNodes);
          if (nodeIndex > -1 && closedNodes[nodeIndex].f < neighborNode.f) {
            continue;
          }
        } else {
          openNodes.push(neighborNode);
        }
      }
    }

    this.setState({
      status: "No path found!"
    });
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
    if (tile.rx == this.state.startPos[0] && tile.y == this.state.startPos[1]) {
      return;
    } else {
      if (tile.rx > -1 && tile.ry > -1 && this.state.tileMap[tile.ry][tile.rx].type == "Y") {
        this.setTile(tile.rx, tile.ry, "P");
        this.markPath(this.state.tileMap[tile.ry][tile.rx]);
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

  setTileScore(x, y, f) {
    var tileMap = this.state.tileMap;
    tileMap[y][x].f = f;

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

    // clear path
    this.clearPath(null);

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
      endPos: tileMapData.endPos,
      status: "New"
    });
  }

  render() {
    return (
      <div style={{ padding: "20px" }}>
        <b>Status: {this.state.status}</b>
        <br />
        <br />
        <input type="button" value="Find Path" onClick={this.findPath.bind(this)} />&nbsp;
        <input type="button" value="Clear Path" onClick={this.clearPath.bind(this)} />&nbsp;
        <input type="button" value="New" onClick={this.reset.bind(this)} />&nbsp;
        <input type="button" value="Clear Map" onClick={this.clearTiles.bind(this)} />&nbsp;
        <input type="button" value="Fill Map" onClick={this.fillWalls.bind(this)} />&nbsp;
        <input type="button" value="Generate Maze" onClick={this.genMaze.bind(this)} />&nbsp;
        <br />
        <br />
        <Board rows={this.state.rows} cols={this.state.cols} tileMap={this.state.tileMap} toggleTile={this.toggleTile.bind(this)} />
      </div>
    );
  }
}

export default App;