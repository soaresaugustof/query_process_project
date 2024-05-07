const graphlib = require('graphlib');

function jsonToOperatorGraph(json) {
    const graph = new graphlib.Graph();

    // Adiciona os nós
    graph.setNode('select');
    graph.setNode('from');
    graph.setNode('where');
    graph.setNode(json.from);

    // Adiciona as arestas
    graph.setEdge('select', 'from');
    graph.setEdge('from', json.from);

    // Adiciona os joins
    for (const join of json.joins) {
        const table = join.table;
        graph.setNode(table);
        graph.setEdge('from', table, { type: 'join', predicate: join.on });
    }

    // Adiciona o where
    for (const condition of json.where) {
        const node = condition.split(' ')[0];
        graph.setNode(node);
        graph.setEdge(node, 'where', { type: 'condition', predicate: condition });
    }

    return graph;
}

function printGraph(graph) {
    const nodes = graph.nodes();
    for (const node of nodes) {
        const successors = graph.successors(node);
        if (successors && successors.length > 0) {
            for (const successor of successors) {
                const edge = graph.edge(node, successor);
                if (edge) {
                    console.log(`${node} --> ${successor}: ${edge.type === 'condition' ? 'WHERE ' : ''}${edge.predicate}`);
                } else {
                    console.log(`${node} --> ${successor}`);
                }
            }
        } else {
            console.log(node);
        }
    }
}

// Exemplo de uso com o JSON fornecido
const json = {
    select: ['idProduto', 'Nome', 'Preco'],
    from: 'Produto',
    joins: [
        {
            table: 'Categoria',
            on: 'Produto.Categoria_idCategoria = Categoria.idCategoria\n' +
                'JOIN Produto ON Ordem.Produto_idProduto = Produto.idProduto\n' +
                'WHERE Preco > 50'
        }
    ],
    where: [],
    isValid: true,
    errors: []
};

export function generateGraph() {
    const operatorGraph = jsonToOperatorGraph(json);
    printGraph(operatorGraph);
}