//import { createGraphService } from "./service";

export function createGraph(req, res){
    const { verifiedQuery } = req.body;

    const {result, relationalAlgebra} = jsonToRelationalAlgebra(verifiedQuery);

    return res.status(200).json(result);
}

function jsonToRelationalAlgebra(json) {
    let algebraExpression = ''; // Inicia a expressão de álgebra relacional

    // Regra 4: Montar árvore
    algebraExpression += buildTree(json);

    return algebraExpression;
}

function buildAlgebraExpression(json) {
    const { select, from, joins, where } = json;

    let tree = {};

    // Aplica a heurística de junção
    let joinCondition = '';
    if (joins && joins.length > 0) {
        joinCondition = `${from} |X| ${joins[0].condition.map(cond => `${cond.leftOperand} ${cond.operator} ${cond.rightOperand}`).join(' ^ ')} ${joins[0].table}`;
    } else {
        joinCondition = from;
    }

    // Aplica a heurística de redução de tuplas
    const tupleReduction = `σ: ${where.map(cond => `${cond.leftOperand} ${cond.operator} ${cond.rightOperand}`).join(' ^ ')} (${joinCondition})`;

    // Aplica a heurística de redução de campos
    const fieldReduction = `Π ${select.join(', ')} (${tupleReduction})`;

    // Constrói a árvore recursivamente
    tree.operation = 'Π';
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
        rightOperand: buildTreeRecursive([], `${currentCondition[1].leftOperand} = ${currentCondition[1].rightOperand} (${leftExpression})`)
    };

    return rightExpression;
}

// Exemplo de JSON representando um comando SQL
const json = {
    select: ['idCliente', 'Nome', 'Email'],
    from: 'Cliente',
    joins: [
        {
            table: 'TipoCliente',
            condition: [
                {
                    leftOperand: 'TipoCliente_idTipoCliente',
                    operator: '=',
                    rightOperand: 'idTipoCliente'
                },
                {
                    leftOperand: 'Nome',
                    operator: '=',
                    rightOperand: 'John'
                }
            ]
        }
    ],
    where: [
        {
            leftOperand: 'Nome',
            operator: '=',
            rightOperand: 'John'
        }
    ]
};

// Testes de conversão de JSON para álgebra relacional 
const { tree, algebraExpression } = buildAlgebraExpression(json);
console.log(tree);
console.log(algebraExpression);

