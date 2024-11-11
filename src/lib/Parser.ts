import { Token, Statement, TokenType, StatementType } from '../types/interfaces';

/* 구문 분석 */
export class Parser {
    public tokens: Token[];
    private position: number;

    public constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.position = 0;
    }

    // 현재 토큰
    public currentToken() {
        return this.tokens[this.position];
    }

    // 토큰 넘기기
    public expect(type: string) {
        const token = this.currentToken();
        if (token.type !== type) throw new Error(`'${type}' 라는 토큰이 와야했지만, '${token.value}' 가 왔습니다.`);
        this.position++;

        return token;
    }

    // 분석
    public parse() {
        const statements: Statement[] = [];
        while (this.position < this.tokens.length) statements.push(this.parseStatement());
        return statements;
    }

    // 상태 분석
    public parseStatement() {
        const token = this.currentToken();
    
        if (token.type === TokenType.VARIABLE) return this.parseVariableDeclaration();
        if (token.type === TokenType.PRINT) return this.parsePrintStatement();
        if (token.type === TokenType.IF) return this.parseIfStatement();
        if (token.type === TokenType.FUNCTION) return this.parseFunctionDeclaration();
        return this.parseExpression();
    }

    // 함수 선언
    public parseFunctionDeclaration() {
        this.expect(TokenType.FUNCTION);
        const identifier = this.expect(TokenType.IDENTIFIER).value;
        const branch = this.parseBlock();
        this.expect(TokenType.SEMICOLON);

        return { type: StatementType.FunctionDeclaration, identifier, branch };
    }

    // 변수 선언
    public parseVariableDeclaration() {
        this.expect(TokenType.VARIABLE);
        const identifier = this.expect(TokenType.IDENTIFIER).value;
        this.expect(TokenType.ASSIGN);
        const value = this.parseExpression();
        this.expect(TokenType.SEMICOLON);

        return { type: StatementType.VariableDeclaration, identifier, value };
    }

    // 조건문
    public parseIfStatement() {
        this.expect(TokenType.IF);
        this.expect(TokenType.ROUND_BRACKET_LEFT);
        const condition = this.parseExpression();
        this.expect(TokenType.ROUND_BRACKET_RIGHT);
        const thenBranch = this.parseBlock();
        let elseBranch: Statement | undefined;

        if (this.currentToken()?.type === TokenType.ELSE) {
            this.expect(TokenType.ELSE);
            elseBranch = this.parseBlock();
        }

        return { type: StatementType.IfStatement, condition, thenBranch, elseBranch };
    }

    // 출력
    public parsePrintStatement() {
        this.expect(TokenType.PRINT);
        const value = this.parseExpression();
        this.expect(TokenType.SEMICOLON);

        return { type: StatementType.PrintStatement, value };
    }

    // 중괄호 안 블록 파싱
    public parseBlock() {
        const statements: Statement[] = [];

        if (this.currentToken().type === TokenType.CURLY_BRACKET_LEFT) {
            this.expect(TokenType.CURLY_BRACKET_LEFT);
            while (this.currentToken().type !== TokenType.CURLY_BRACKET_RIGHT) statements.push(this.parseStatement());
            this.expect(TokenType.CURLY_BRACKET_RIGHT);

        } else statements.push(this.parseStatement());

        return { type: StatementType.BlockStatement, statements };
    }

    // 표현식
    public parseExpression() {
        let left = this.parseTerm();

        while (this.currentToken()?.type && [TokenType.PLUS, TokenType.MINUS].includes(this.currentToken().type)) {
            const operator = this.expect(this.currentToken().type).value;
            const right = this.parseTerm();
            
            left = { type: StatementType.BinaryExpression, operator, left, right };
        }

        return left;
    }

    parseTerm() {
        let left = this.parseRelational();

        while (this.currentToken()?.type && [TokenType.MULTIPLY, TokenType.DIVIDE].includes(this.currentToken().type)) {
            const operator = this.expect(this.currentToken().type).value;
            const right = this.parseRelational();
            
            left = { type: StatementType.BinaryExpression, operator, left, right };
        }

        return left;
    }

    parseRelational() {
        const relationalOperators = [TokenType.LESS, TokenType.GREATER, TokenType.LESS_EQUAL, TokenType.GREATER_EQUAL, TokenType.EQUALITY, TokenType.NOT_EQUAL];
        let left: Statement = this.parseFactor();

        while (this.currentToken()?.type && relationalOperators.includes(this.currentToken().type)) {
            const operator = this.expect(this.currentToken().type).value;
            const right = this.parseFactor();
            
            left = { type: StatementType.BinaryExpression, operator, left, right };
        }

        return left;
    }

    parseFactor() {
        return this.parseMemberExpression();
    }

    parseMemberExpression() {
        const object = this.parsePrimary();
        return object;
    }

    parsePrimary() {
        const token = this.currentToken();

        if (token.type === TokenType.NUMBER || token.type === TokenType.STRING) {
            this.position++;
            return { type: StatementType.Literal, value: token.value };
        }

        if (token.type === TokenType.IDENTIFIER) {
            this.position++;
            const identifier = token.value;
            return { type: StatementType.Identifier, name: identifier };
        }

        throw new Error(`표현식에서 예기치 않은 토큰: ${token.value}`);
    }
}
