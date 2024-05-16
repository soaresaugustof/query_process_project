
export function buildAlgebraExpression(json) {
    const { select, from, joins, where } = json;

    let tree = {};

    // Aplica a heurística de junção
    let joinCondition = '';
    if (joins && joins.length > 0) {
        joinCondition = `produto |X| ${joins[0].condition.map(cond => `${cond.leftOperand} ${cond.operator} ${cond.rightOperand}`).join(' ^ ')} ${joins[0].table}`;
    } else {
        joinCondition = from;
    }

    // Aplica a heurística de redução de tuplas
    const tupleReduction = `σ: ${where.map(cond => `${cond.leftOperand} ${cond.operator} ${cond.rightOperand}`).join(' ^ ')} (${joinCondition})`;

    // Aplica a heurística de redução de campos
    const fieldReduction = `π ${select.join(', ')} (${tupleReduction})`;

    // Constrói a árvore recursivamente
    tree.operation = 'π';
    tree.leftOperand = select.join(', ');
    tree.rightOperand = buildTreeRecursive(joins.map(join => join.condition), joinCondition);

    return { tree, algebraExpression: fieldReduction };
}

function buildTreeRecursive(conditions, expression) {
    if (conditions.length === 0) {
        return expression;
    }

    const [currentCondition, ...restConditions] = conditions;

    const leftExpression = buildTreeRecursive(restConditions, expression);
    const rightExpression = {
        operation: '|X|',
        leftOperand: `${currentCondition[0].leftOperand} ${currentCondition[0].operator} ${currentCondition[0].rightOperand}`,
        rightOperand: buildTreeRecursive([], `σ: ${currentCondition[1].leftOperand} = ${currentCondition[1].rightOperand} (${leftExpression})`)
    };

    return rightExpression;
}