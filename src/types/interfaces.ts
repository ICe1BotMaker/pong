/* eslint-disable @typescript-eslint/no-explicit-any */

/* 타입 */
export enum TokenType {
    VARIABLE = 'VARIABLE',
    PRINT = 'PRINT',
    IF = 'IF',
    ELSE = 'ELSE',
    FUNCTION = 'FUNCTION',

    IDENTIFIER = 'IDENTIFIER',
    NUMBER = 'NUMBER',
    STRING = 'STRING',

    ASSIGN = 'ASSIGN',
    SEMICOLON = 'SEMICOLON',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    MULTIPLY = 'MULTIPLY',
    DIVIDE = 'DIVIDE',
    LESS = 'LESS',
    GREATER = 'GREATER',
    LESS_EQUAL = 'LESS_EQUAL',
    GREATER_EQUAL = 'GREATER_EQUAL',
    EQUALITY = 'EQUALITY',
    NOT_EQUAL = 'NOT_EQUAL',
    
    ROUND_BRACKET_LEFT = 'ROUND_BRACKET_LEFT',
    ROUND_BRACKET_RIGHT = 'ROUND_BRACKET_RIGHT',
    CURLY_BRACKET_LEFT = 'CURLY_BRACKET_LEFT',
    CURLY_BRACKET_RIGHT = 'CURLY_BRACKET_RIGHT',
}

export enum StatementType {
    VariableDeclaration = 'VariableDeclaration',
    IfStatement = 'IfStatement',
    BlockStatement = 'BlockStatement',
    BinaryExpression = 'BinaryExpression',
    Literal = 'Literal',
    Identifier = 'Identifier',
    PrintStatement = 'PrintStatement',
    FunctionDeclaration = 'FunctionDeclaration',
}

/* 인터페이스 */
export interface Token {
    type: TokenType;
    value: any;
}

export interface Statement {
    type: StatementType;
    identifier?: any;
    value?: any;
    condition?: any;
    elseBranch?: Statement;
    thenBranch?: Statement;
    operator?: any;
    left?: any;
    right?: any;
    name?: any;
    statements?: Statement[];
}
