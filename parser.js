import { lex } from './lexer.js';

export function parse(code) {
    const lines = code.split('\n').map(line => line.trim()).filter(line => line !== '');
    const tokens = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index];
        const lineTokens = lex(line);

        if (lineTokens.some(token => token.type === 'LEFT_BRACE')) {
            let blockTokens = [...lineTokens];
            let braceCount = 1;
            index++;

            while (braceCount > 0 && index < lines.length) {
                const blockLine = lines[index];
                const blockLineTokens = lex(blockLine);
                blockTokens.push(...blockLineTokens);

                braceCount += blockLineTokens.filter(token => token.type === 'LEFT_BRACE').length;
                braceCount -= blockLineTokens.filter(token => token.type === 'RIGHT_BRACE').length;

                index++;
            }

            if (braceCount !== 0) {
                throw new Error('Unmatched braces in block');
            }

            tokens.push(blockTokens);
        } else {
            tokens.push(lineTokens);
            index++;
        }
    }

    const statements = [];
    tokens.forEach((lineTokens, lineIndex) => {
        try {
            const statement = parseTokens(lineTokens, lineIndex + 1);
            statements.push(statement);
        } catch (error) {
            throw new Error(`Error on line ${lineIndex + 1}: ${error.message}`);
        }
    });

    return statements;
}

function parseTokens(tokens, lineNumber) {
    if (tokens.length === 0) {
        throw new Error(`Empty or invalid line at ${lineNumber}`);
    }

    const [firstToken, ...restTokens] = tokens;

    if (firstToken.type === 'KEYWORD' && firstToken.value === 'print') {
        return parsePrint(restTokens);
    } else if (firstToken.type === 'IDENTIFIER' && restTokens[0]?.type === 'ASSIGNMENT') {
        return parseAssignment(firstToken, restTokens.slice(1));
    } else if (firstToken.type === 'IF') {
        return parseIf(tokens.slice(1));
    }

    throw new Error(`Unknown command or syntax on line ${lineNumber}`);
}

function parseAssignment(identifierToken, valueTokens) {
    const value = parseExpression(valueTokens);
    return {
        type: 'AssignmentStatement',
        variable: identifierToken.value,
        value,
    };
}

function parsePrint(tokens) {
    if (tokens[0]?.type !== 'LEFT_PAREN' || tokens[tokens.length - 1]?.type !== 'RIGHT_PAREN') {
        throw new Error(`"print" syntax must use parentheses`);
    }

    const argumentTokens = tokens.slice(1, -1);
    if (argumentTokens.length === 0) {
        throw new Error(`"print" requires an argument`);
    }

    const argument = parseExpression(argumentTokens);
    return {
        type: 'PrintStatement',
        value: argument,
    };
}

function parseIf(tokens) {
    if (tokens[0]?.type !== 'LEFT_PAREN') {
        throw new Error(`"if" condition must start with '('`);
    }

    const conditionEnd = tokens.findIndex(token => token.type === 'RIGHT_PAREN');
    if (conditionEnd === -1) {
        throw new Error('Missing closing parenthesis for condition');
    }

    const conditionTokens = tokens.slice(1, conditionEnd);
    const condition = parseExpression(conditionTokens);

    const bodyStart = tokens.findIndex((token, index) => index > conditionEnd && token.type === 'LEFT_BRACE');
    if (bodyStart === -1) {
        throw new Error('Missing opening brace for "if" body');
    }

    let braceCount = 1;
    let bodyEnd = -1;
    for (let i = bodyStart + 1; i < tokens.length; i++) {
        if (tokens[i].type === 'LEFT_BRACE') braceCount++;
        if (tokens[i].type === 'RIGHT_BRACE') braceCount--;
        if (braceCount === 0) {
            bodyEnd = i;
            break;
        }
    }

    if (bodyEnd === -1) {
        throw new Error('Missing closing brace for "if" body');
    }

    const bodyTokens = tokens.slice(bodyStart + 1, bodyEnd);

    const bodyStatements = [];
    let currentTokens = [];
    for (const token of bodyTokens) {
        if (token.type === 'KEYWORD' && currentTokens.length > 0) {
            bodyStatements.push(parseTokens(currentTokens, -1));
            currentTokens = [];
        }
        currentTokens.push(token);
    }
    if (currentTokens.length > 0) {
        bodyStatements.push(parseTokens(currentTokens, -1));
    }

    return {
        type: 'IfStatement',
        condition,
        body: bodyStatements,
    };
}

function parseExpression(tokens) {
    const precedence = {
        'OR': 1,
        'AND': 2,
        'NOT': 3,
        '==': 4,
        '!=': 4,
        '>': 5,
        '<': 5,
        '>=': 5,
        '<=': 5,
        '+': 6,
        '-': 6,
        '*': 7,
        '/': 7,
    };
    const isOperator = token => token.type === 'OPERATOR' || token.type === 'COMPARISON_OPERATOR' || token.type === 'LOGICAL_OPERATOR';

    const stack = [];
    const output = [];

    tokens.forEach(token => {
        if (token.type === 'NUMBER' || token.type === 'IDENTIFIER' || token.type === 'STRING') {
            output.push(token);
        } else if (isOperator(token)) {
            while (
                stack.length > 0 &&
                isOperator(stack[stack.length - 1]) &&
                precedence[stack[stack.length - 1].value] >= precedence[token.value]
            ) {
                output.push(stack.pop());
            }
            stack.push(token);
        } else if (token.type === 'LEFT_PAREN') {
            stack.push(token);
        } else if (token.type === 'RIGHT_PAREN') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LEFT_PAREN') {
                output.push(stack.pop());
            }
            if (stack.length === 0 || stack.pop().type !== 'LEFT_PAREN') {
                throw new Error('Mismatched parentheses');
            }
        } else {
            throw new Error(`Invalid token in expression: ${token.value}`);
        }
    });

    while (stack.length > 0) {
        const token = stack.pop();
        if (token.type === 'LEFT_PAREN') {
            throw new Error('Mismatched parentheses');
        }
        output.push(token);
    }

    return buildASTFromRPN(output);
}

function buildASTFromRPN(tokens) {
    const stack = [];

    tokens.forEach(token => {
        if (token.type === 'NUMBER' || token.type === 'IDENTIFIER' || token.type === 'STRING') {
            stack.push({ type: 'Literal', value: token.value });
        } else if (token.type === 'OPERATOR' || token.type === 'COMPARISON_OPERATOR' || token.type === 'LOGICAL_OPERATOR') {
            const right = stack.pop();
            const left = stack.pop();
            if (!left || !right) {
                throw new Error('Invalid expression');
            }
            stack.push({
                type: token.type === 'LOGICAL_OPERATOR' ? 'LogicalExpression' : 'BinaryExpression',
                operator: token.value,
                left,
                right,
            });
        } else {
            throw new Error(`Unexpected token in RPN: ${token.value}`);
        }
    });

    if (stack.length !== 1) {
        throw new Error('Invalid expression');
    }

    return stack[0];
}
