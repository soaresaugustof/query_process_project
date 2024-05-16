export const inputExample = {
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