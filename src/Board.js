import React, { Component, PropTypes } from 'react';
import Tile from './Tile';

export default class Board extends Component {
	constructor() {
		super();
	}

	render() {
		const numTiles = this.props.rows * this.props.cols;
		var rows = [];
		var start = Math.floor(Math.random() * (numTiles / 2));
		var end = Math.floor(Math.random() * (numTiles - (numTiles / 2)) + (numTiles / 2));

		for (let r = 0; r < this.props.rows; r++) {
			var cols = [];

			for (let c = 0; c < this.props.cols; c++) {
				var type = this.props.tileMap[r][c].type;
				var marker = this.props.tileMap[r][c].marker;
				var backgroundColor = "#EEE";
				var color = "#CCC";

				if (type == "S") {
					backgroundColor = "#0F0";
				} else if (type == "E") {
					backgroundColor = "#F00";
				} else if (type == "#") {
					backgroundColor = "#777";
				} else if (type == "P") {
					backgroundColor = "#FF5";
					color = "#00F";
				} else if (type == "Y") {
					backgroundColor = "#FF0";
				} else if (type == "O") {
					backgroundColor = "#FF5";
				}

				cols.push(<Tile key={c + "_" + r} type={type} color={color} marker={marker} xPos={c} yPos={r} bgColor={backgroundColor} toggleTile={this.props.toggleTile} />);
			}

			rows.push(<tr>{cols}</tr>)
		}

		var tiles = <tbody>{rows}</tbody>;

		return (
			<table style={{ border: "1px solid #777", padding: "0", margin: "0", cellPadding: "0", cellSpacing: "0" }} >
				{tiles}
			</table>
		);
	}
}