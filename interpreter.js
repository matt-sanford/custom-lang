export function interpret(statements) {
    const variables = new Map(); // Symbol table for variables

    statements.forEach(statement => {
        switch (statement.type) {
            case 'PrintStatement':
                executePrint(statement, variables);
                break;
            case 'AssignmentStatement':
                executeAssignment(statement, variables);
                break;
            case 'IfStatement':
                executeIf(statement, variables);
                break;
            default:
                throw new Error(`Unknown statement type: ${statement.type}`);
        }
    });
}

function executePrint(statement, variables) {
    const output = evaluateExpression(statement.value, variables);
    console.log(output);
}

function executeAssignment(statement, variables) {
    const value = evaluateExpression(statement.value, variables);
    variables.set(statement.variable, value);
}

function executeIf(statement, variables) {
    const condition = evaluateExpression(statement.condition, variables);
    if (condition) {
        interpret(statement.body); // Interpret the body of the `if` statement
    }
}

function evaluateExpression(node, variables) {
    switch (node.type) {
        case 'Literal':
            if (typeof node.value === 'string' && variables.has(node.value)) {
                return variables.get(node.value); // Resolve variable value
            }
            return node.value; // Return literal value
        case 'BinaryExpression':
            const left = evaluateExpression(node.left, variables);
            const right = evaluateExpression(node.right, variables);
            switch (node.operator) {
                case '+':
                    return left + right;
                case '-':
                    return left - right;
                case '*':
                    return left * right;
                case '/':
                    if (right === 0) {
                        throw new Error('Division by zero');
                    }
                    return left / right;
                case '>':
                    return left > right;
                case '<':
                    return left < right;
                case '>=':
                    return left >= right;
                case '<=':
                    return left <= right;
                case '==':
                    return left === right;
                case '!=':
                    return left !== right;
                default:
                    throw new Error(`Unknown operator: ${node.operator}`);
            }
        case 'LogicalExpression':
            const leftLogical = evaluateExpression(node.left, variables);
            const rightLogical = evaluateExpression(node.right, variables);
            switch (node.operator) {
                case 'AND':
                    return leftLogical && rightLogical;
                case 'OR':
                    return leftLogical || rightLogical;
                default:
                    throw new Error(`Unknown logical operator: ${node.operator}`);
            }
        default:
            throw new Error(`Unknown expression type: ${node.type}`);
    }
}

