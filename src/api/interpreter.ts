import { t } from "i18next";
import { Relation } from "db/exec/Relation";
import { parseRelalg, relalgFromRelalgAstRoot, replaceVariables } from "db/relalg";

import { RANode } from "src/db/exec/RANode";
import memoize from 'memoize-one';

export function Interpreter(text: string, relations: { [name: string]: Relation }) {
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
    console.log(result?._rows);
    
    return root;
}

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