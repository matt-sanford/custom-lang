export function lex(line) {
    const tokens = [];
    const regex = /"([^"]*)"|AND|OR|NOT|[+\-*/=<>!(){}]|[^\s+\-*/=<>!(){}]+/g; // Match comparison operators, logical operators, braces, and other tokens

    let match;
    while ((match = regex.exec(line)) !== null) {
        const word = match[0];

        if (word === 'AND' || word === 'OR' || word === 'NOT') {
            tokens.push({ type: 'LOGICAL_OPERATOR', value: word });
        } else if (word === '{') {
            tokens.push({ type: 'LEFT_BRACE', value: '{' });
        } else if (word === '}') {
            tokens.push({ type: 'RIGHT_BRACE', value: '}' });
        } else if (word === 'if') {
            tokens.push({ type: 'IF', value: 'if' });
        } else if (['+', '-', '*', '/'].includes(word)) {
            tokens.push({ type: 'OPERATOR', value: word });
        } else if (['>', '<', '>=', '<=', '==', '!='].includes(word)) {
            tokens.push({ type: 'COMPARISON_OPERATOR', value: word });
        } else if (word === '=') {
            tokens.push({ type: 'ASSIGNMENT', value: '=' });
        } else if (word === '(') {
            tokens.push({ type: 'LEFT_PAREN', value: '(' });
        } else if (word === ')') {
            tokens.push({ type: 'RIGHT_PAREN', value: ')' });
        } else if (word.startsWith('"') && word.endsWith('"')) {
            tokens.push({ type: 'STRING', value: word.slice(1, -1) });
        } else if (isKeyword(word)) {
            tokens.push({ type: 'KEYWORD', value: word });
        } else if (isNumber(word)) {
            tokens.push({ type: 'NUMBER', value: parseFloat(word) });
        } else if (isIdentifier(word)) {
            tokens.push({ type: 'IDENTIFIER', value: word });
        } else {
            throw new Error(`Unrecognized token: "${word}"`);
        }
    }

    return tokens;
}

function isKeyword(word) {
    return ['print', 'if'].includes(word);
}

function isNumber(word) {
    return !isNaN(word);
}

function isIdentifier(word) {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word);
}
