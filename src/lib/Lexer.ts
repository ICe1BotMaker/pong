import { Token, TokenType } from '../types/interfaces';

/* 어휘 분석 */
export class Lexer {
    public tokens: Token[];

    private input: string;
    private position: number;

    public constructor(input: string) {
        this.tokens = [];

        this.input = input;
        this.position = 0;
    }

    /* IS _ */
    isDigit(char: string) {
        return /[0-9]/.test(char);
    }

    isLetter(char: string) {
        return /[a-zA-Z_]/i.test(char);
    }

    isIdentifier(char: string) {
        return /[a-zA-Z0-9_]/i.test(char);
    }

    isQuote(char: string) {
        return char === '"' || char === '\'';
    }

    /* 분석 */
    tokenize() {
        while (this.position < this.input.length) {
            const char = this.input[this.position];

            // 띄어쓰기나 줄바꿈은 무시
            if (char === ' ' || char === '\n' || char === '\t') {
                this.position++;
                continue;
            }

            // 주석
            if (char === '/' && this.input[this.position + 1] === '/') {
                this.position += 2;
                while (this.position < this.input.length && this.input[this.position] !== '\n') this.position++;
                continue;
            }

            if (char === '/' && this.input[this.position + 1] === '*') {
                this.position += 2;
                while (this.position < this.input.length && !(this.input[this.position] === '*' && this.input[this.position + 1] === '/')) this.position++;
                this.position += 2;
                continue;
            }

            // 기본
            if (this.isDigit(char)) this.tokens.push(this.tokenizeNumber());
            else if (this.isLetter(char)) this.tokens.push(this.tokenizeIdentifier());
            else if (this.isQuote(char)) this.tokens.push(this.tokenizeString());

            else if (char === '=' && this.input[this.position + 1] !== '=') {
                this.tokens.push({ type: TokenType.ASSIGN, value: '=' });
                this.position++;

            } else if (char === '=') {
                if (this.input[this.position + 1] === '=') {
                    this.tokens.push({ type: TokenType.EQUALITY, value: '==' });
                    this.position += 2;

                } else {
                    this.tokens.push({ type: TokenType.ASSIGN, value: '=' });
                    this.position++;
                }

            } else if (char === '!') {
                if (this.input[this.position + 1] === '=') {
                    this.tokens.push({ type: TokenType.NOT_EQUAL, value: '!=' });
                    this.position += 2;

                } else throw new Error(`알 수 없는 연산자: ${char}`);

            } else if (char === '<') {
                if (this.input[this.position + 1] === '=') {
                    this.tokens.push({ type: TokenType.LESS_EQUAL, value: '<=' });
                    this.position += 2;
                    
                } else {
                    this.tokens.push({ type: TokenType.LESS, value: '<' });
                    this.position++;
                }

            } else if (char === '>') {
                if (this.input[this.position + 1] === '=') {
                    this.tokens.push({ type: TokenType.GREATER_EQUAL, value: '>=' });
                    this.position += 2;

                } else {
                    this.tokens.push({ type: TokenType.GREATER, value: '>' });
                    this.position++;
                }

            } else if (char === '+') {
                this.tokens.push({ type: TokenType.PLUS, value: '+' });
                this.position++;

            } else if (char === '*') {
                this.tokens.push({ type: TokenType.MULTIPLY, value: '*' });
                this.position++;

            } else if (char === '-') {
                this.tokens.push({ type: TokenType.MINUS, value: '-' });
                this.position++;

            } else if (char === '/') {
                this.tokens.push({ type: TokenType.DIVIDE, value: '/' });
                this.position++;

            } else if (char === '(') {
                this.tokens.push({ type: TokenType.ROUND_BRACKET_LEFT, value: '(' });
                this.position++;

            } else if (char === ')') {
                this.tokens.push({ type: TokenType.ROUND_BRACKET_RIGHT, value: ')' });
                this.position++;

            } else if (char === '{') {
                this.tokens.push({ type: TokenType.CURLY_BRACKET_LEFT, value: '{' });
                this.position++;

            } else if (char === '}') {
                this.tokens.push({ type: TokenType.CURLY_BRACKET_RIGHT, value: '}' });
                this.position++;

            } else if (char === ';') {
                this.tokens.push({ type: TokenType.SEMICOLON, value: ';' });
                this.position++;

            } else throw new Error(`알 수 없는 문자: ${char}`);
        }

        return this.tokens;
    }

    public tokenizeNumber() {
        const start = this.position;
        let hasDot = false;

        while (this.position < this.input.length) {
            const char = this.input[this.position];

            if (this.isDigit(char)) this.position++;
            else if (char === '.' && !hasDot) {
                hasDot = true;
                this.position++;

            } else break;
        }

        return { type: TokenType.NUMBER, value: parseFloat(this.input.slice(start, this.position)) };
    }

    public tokenizeString() {
        this.position++;
        const start = this.position;
        while (this.position < this.input.length && !this.isQuote(this.input[this.position])) this.position++;

        if (this.position >= this.input.length) throw new Error('문자열이 닫히지 않았습니다.');

        const value = this.input.slice(start, this.position);
        this.position++;

        return { type: TokenType.STRING, value };
    }

    public tokenizeIdentifier() {
        const start = this.position;
        while (this.position < this.input.length && this.isIdentifier(this.input[this.position])) this.position++;
        const value = this.input.slice(start, this.position);

        if (value === 'var') return { type: TokenType.VARIABLE, value };
        if (value === 'print') return { type: TokenType.PRINT, value };
        if (value === 'if') return { type: TokenType.IF, value };
        if (value === 'function') return { type: TokenType.FUNCTION, value };
        return { type: TokenType.IDENTIFIER, value };
    }
}
