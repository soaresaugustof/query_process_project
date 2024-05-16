import './App.css';
import { useState } from 'react';
import icon from './assets/icon.png';
import Tree from 'react-d3-tree';

const schema = {
  BD_Vendas: {
    Categoria: {
      columns: ["idCategoria", "Descricao"],
      primaryKey: "idCategoria",
    },
    Produto: {
      columns: [
        "idProduto",
        "Nome",
        "Descricao",
        "Preco",
        "QuantEstoque",
        "Categoria_idCategoria",
      ],
      primaryKey: "idProduto",
      foreignKeys: { Categoria_idCategoria: "Categoria" },
    },
    TipoCliente: {
      columns: ["idTipoCliente", "Descricao"],
      primaryKey: "idTipoCliente",
    },
    Cliente: {
      columns: [
        "idCliente",
        "Nome",
        "Email",
        "Nascimento",
        "Senha",
        "TipoCliente_idTipoCliente",
        "DataRegistro",
      ],
      primaryKey: "idCliente",
      foreignKeys: { TipoCliente_idTipoCliente: "TipoCliente" },
    },
  },
};

function parseSQLQuery(query) {
  const regex = {
    select: /SELECT\s+(.+?)\s+FROM\s+/is,
    from: /FROM\s+([\w\s]+?)(?:\s+JOIN|\s+WHERE|$)/i,
    join: /JOIN\s+([\w\s]+?)\s+ON\s+([\w\s\.\=\>\<\('\"]+)/gi,
    where: /WHERE\s+([\w\s\.\=\>\<\('\"]+)/i,
  };

  function parseWhereCondition(condition) {
    const conditionRegex = /(\w+)\s*(=|>|<|>=|<=|<>)\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\w+)?/g;
    let match;
    const conditions = [];

    while ((match = conditionRegex.exec(condition)) !== null) {
      if (!match[3]) {
        throw new Error(`Missing value for condition in WHERE clause: ${match[0].trim()}`);
      }
      if ((match[3].startsWith("'") && !match[3].endsWith("'")) || (match[3].startsWith('"') && !match[3].endsWith('"'))) {
        throw new Error(` Incomplete string literal in WHERE clause: ${match[3]}`);
      }
      conditions.push({
        leftOperand: match[1],
        operator: match[2],
        rightOperand: match[3],
        isLiteral: match[3].startsWith("'") || match[3].startsWith('"')
      });
    }
    return conditions;
  }

  const selectMatch = query.match(regex.select);
  const fromMatch = query.match(regex.from);
  const whereMatch = query.match(regex.where);

  let joins = [];
  let joinMatch;
  while ((joinMatch = regex.join.exec(query)) !== null) {
    joins.push({
      table: joinMatch[1].trim(),
      condition: parseWhereCondition(joinMatch[2]),
    });
  }

  return {
    select: selectMatch ? selectMatch[1].split(",").map(s => s.trim()) : [],
    from: fromMatch ? fromMatch[1].trim() : null,
    joins: joins,
    where: whereMatch ? parseWhereCondition(whereMatch[1]) : [],
  };
}

// Example SQL query
const exampleQuery = `
SELECT idCliente, Nome, Email
FROM Cliente
JOIN TipoCliente ON Cliente.TipoCliente_idTipoCliente = TipoCliente.idTipoCliente
WHERE Nome = 'John Doe'
`;

// Parse the query
const parsedQuery = parseSQLQuery(exampleQuery);

console.log(parsedQuery);
console.log(parsedQuery.joins[0].condition);

function validateQuery(parsedQuery, schema) {
  let errors = [];

  // Validate FROM table
  const fromTable = parsedQuery.from;
  if (!schema[fromTable]) {
    errors.push(` Table '${fromTable}' does not exist.`);
  } else {
    // Validate SELECT columns
    parsedQuery.select.forEach((column) => {
      if (!schema[fromTable].columns.includes(column)) {
        errors.push(` Column '${column}' does not exist in table '${fromTable}'.`);
      }
    });

    // Validate WHERE conditions
    parsedQuery.where.forEach((cond) => {
      if (!schema[fromTable].columns.includes(cond.leftOperand)) {
        errors.push(` Column '${cond.leftOperand}' in WHERE condition does not exist in table '${fromTable}'.`);
      }
      // Check if the right operand should be a column name
      if (!cond.isLiteral && !schema[fromTable].columns.includes(cond.rightOperand)) {
        errors.push(` Column '${cond.rightOperand}' does not exist in table '${fromTable}'.`);
      }
    });
  }

  // Validate JOINs
  parsedQuery.joins.forEach((join) => {
    const joinTable = join.table;
    if (!schema[joinTable]) {
      errors.push(` Join table '${joinTable}' does not exist.`);
    } else {
      join.condition.forEach((cond) => {
        // Validate the foreign key relationship
        if (!schema[fromTable].columns.includes(cond.leftOperand)) {
          errors.push(` Foreign key '${cond.leftOperand}' does not exist in '${fromTable}'.`);
        }
        // Check if right operand is a literal or a column name
        if (!cond.isLiteral && (cond.rightOperand !== joinTable && !schema[joinTable].columns.includes(cond.rightOperand))) {
          errors.push(` Column '${cond.rightOperand}' does not exist in table '${joinTable}'.`);
        }
      });
    }
  });

  return errors.length > 0 ? errors : " No errors found. The query is valid.";
}

// Run the validation
const validationResult = validateQuery(parsedQuery, schema.BD_Vendas);
console.log(validationResult);

const Modal = ({ show, handleClose, children }) => {
  return (
    <div className={`modal ${show ? 'show' : ''}`}>
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        {children}
      </div>
    </div>
  );
};

function App() {
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [displayFeedback, setDisplayFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);

  const animateText = (text, setter) => {
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length - 1) {
        setter(prev => prev + text[i]);
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, 50);
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFeedback('');
    setDisplayFeedback('');

    try {
      const parsedQuery = parseSQLQuery(query);
      const validationResult = validateQuery(parsedQuery, schema.BD_Vendas);
      const result = Array.isArray(validationResult) ? validationResult.join(', ') : validationResult;

      setFeedback(result);
      setTimeout(() => animateText(result, setDisplayFeedback), 500);
    } catch (error) {
      setFeedback(` ${error.message}`);
      animateText(` ${error.message}`, setDisplayFeedback);
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Example tree data for the graph
  const treeData = [
    {
      name: 'Database',
      children: [
        {
          name: 'Tables',
          children: [
            {
              name: 'Client',
              children: [
                { name: 'idClient' },
                { name: 'Name' },
                { name: 'Email' },
                { name: 'Nascimento' },
                { name: 'Senha' },
                { name: 'DataRegistro' },
                { name: 'TipoCliente_idTipoCliente' }
              ]
            },
            {
              name: 'TipoCliente',
              children: [
                { name: 'idTipoCliente' },
                { name: 'Description' }
              ]
            },
            {
              name: 'Product',
              children: [
                { name: 'idProduct' },
                { name: 'Name' },
                { name: 'Description' },
                { name: 'Price' },
                { name: 'QuantEstoque' },
                { name: 'Categoria_idCategoria' }
              ]
            },
            {
              name: 'Category',
              children: [
                { name: 'idCategoria' },
                { name: 'Description' }
              ]
            }
          ]
        },
        {
          name: 'Relationships',
          children: [
            {
              name: 'Foreign Keys',
              children: [
                { name: 'Client.TipoCliente_idTipoCliente -> TipoCliente.idTipoCliente' },
                { name: 'Product.Categoria_idCategoria -> Category.idCategoria' }
              ]
            }
          ]
        }
      ]
    }
  ];

  return (
    <div className="App">
      <img src={icon} style={{ width: 80 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 className="title">Query Process Simulator</h1>
        <h1 className="title blink">.</h1>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <textarea
          value={query}
          onChange={handleQueryChange}
          placeholder="Enter your SQL query here"
          rows="10"
          cols="70"
        />
        <button type="submit" style={{ width: '30%', marginTop: 20 }} className='button-text'>Validate</button>
      </form>
      {feedback && (
        <div className="typewriter" style={{ marginTop: 20 }}>
          <pre style={{ color: feedback === " No errors found. The query is valid." ? 'lime' : 'red' }}>{displayFeedback}</pre>
          {feedback === " No errors found. The query is valid." && (
            <button className='button-text' style={{backgroundColor: 'transparent', border: "none", color: 'lime'}} onClick={openModal}>
              (View graph)
            </button>
          )}
        </div>
      )}
      <Modal show={showModal} handleClose={closeModal}>
          <Tree data={treeData} orientation="vertical" />
      </Modal>
    </div>
  );
}



export default App;