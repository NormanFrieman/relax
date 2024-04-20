import React from "react";
import { connect } from "react-redux";
import * as store from 'calc2/store';
import { RouteComponentProps } from "react-router-dom";
import { Relation } from "src/db/exec/Relation";
import { t } from "i18next";
import { parseRelalg, relalgFromRelalgAstRoot, replaceVariables } from "db/relalg";

import { RANode } from "src/db/exec/RANode";
import memoize from 'memoize-one';
import { Table } from "src/db/exec/Table";


type Props = RouteComponentProps<{
	source: string,
	id: string,
	filename: string,
	index: string,
	query: string
}> & {
	groups: store.State['groups']
};

export class InterpreterPage extends React.Component<Props> {
	render() {
		const params = this.props.location.pathname.split('/');
		const query = params[params.length - 1];
		const group = this.props.groups.current?.group;
		if (group == undefined)
			return;

		console.log(query);

		const relations: { [name: string]: Relation } = {};
		group.tables.forEach(table => {
			relations[table.tableName] = table.relation;
		});

		const { rows } = Interpreter(query, relations);
		console.log(rows);

		return (
			<div>
				<pre>
					{JSON.stringify(rows)}
				</pre>
			</div>
		);
	}
}



export const InterpreterFunc = connect((state: store.State) => {
	return {
		groups: state.groups
	}
})(InterpreterPage)



export function Interpreter(text: string, relations: { [name: string]: Relation }): InterpreterResult {
    const ast = parseRelalg(text, Object.keys(relations));
    replaceVariables(ast, relations);

    if (ast.child === null) {
        if (ast.assignments.length > 0) {
            throw new Error(t('calc.messages.error-query-missing-assignments-found'));
        }
        else {
            throw new Error(t('calc.messages.error-query-missing'));
        }
    }

    const root = relalgFromRelalgAstRoot(ast, relations);
    root.check();

    const result = getResultForCsv(root)
    
    return { root: root, rows: result };
}

export type InterpreterResult = { root: RANode, rows: Table | null };

function getResultForCsv(activeNode: RANode) {
    const result = memoize(
        (node: RANode) => {
            try {
                node.check();
                return node.getResult();
            }
            catch (e) {
                console.error(e);
                return null;
            }
        },
    );
    
    return result(activeNode);
}