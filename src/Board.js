import React, { Component } from 'react';
import Tile from './Tile';

export default class Board extends Component {
	
	render() {
		var rows = [];

		for (let r = 0; r < this.props.rows; r++) {
			var cols = [];

			for (let c = 0; c < this.props.cols; c++) {
				var type = this.props.tileMap[r][c].type;
				var marker = this.props.tileMap[r][c].marker;
				var f = 0;
				var cr = "00";
				var cg = "00";
				var cb = "00";
				var backgroundColor = "#EEE";
				var color = "#AAA";

				if (this.props.tileMap[r][c].f) {
					f = Math.floor(this.props.tileMap[r][c].f);

					var tb = Math.max(Math.min(Math.floor(f), 255), 0);
					var tg = Math.max(Math.min(Math.floor(tb/1.25), 255), 0);
					var tr = Math.max(Math.min(Math.floor(tb/1.5), 255), 0);

					cb = tb.toString(16);
					cg = tg.toString(16);
					cr = tr.toString(16);
				}

				if (type === "S") {
					backgroundColor = "#0F0";
				} else if (type === "E") {
					backgroundColor = "#F00";
				} else if (type === "#") {
					backgroundColor = "#777";
				} else if (type === "P") {
					backgroundColor = "#" + cr + cg + cb;
					color = "#FFF";
				} else if (type === "Y") {
					backgroundColor = "#EEE";
				} else if (type === "O") {
					backgroundColor = "#EEE";
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