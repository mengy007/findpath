import React, { Component, PropTypes } from 'react';

/**
 * Tile Class
 * ==========
 * Defines the Tile component to be used with the board.
 **/
export default class Tile extends Component {
	handleClick(e) {
		this.props.toggleTile(this.props.xPos, this.props.yPos);
	}

	render() {
		return (
			<td style={{
				width: "20px",
				height: "20px",
				backgroundColor: this.props.bgColor,
				cursor: "pointer"
			}} onClick={this.handleClick.bind(this)} ></td>
		);
	}
}