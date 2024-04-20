import React from "react";

type Props = {
	query: string;
}

export class Interpreter extends React.Component<Props> {
	render() {
		console.log(this.props.query);

		return (
			<span>test</span>
		);
	}
}