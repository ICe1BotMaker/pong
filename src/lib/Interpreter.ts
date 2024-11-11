/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
import { Statement, StatementType } from '../types/interfaces';

/* 인터프리터 */
export class Interpreter {
    public ast: Statement[];
    
    public variables: any;
    public functions: any;
    public functionNodes: any;
    // 변수 외 선언은 알아서

    constructor(ast: Statement[]) {
        this.ast = ast;

        this.variables = {};
        this.functions = {};
        this.functionNodes = {};
    }

    // eval
    evaluate(node?: Statement): any {
        if (!node) throw new Error(`노드가 존재하지 않습니다.`);
        
        switch (node.type) {
            case StatementType.FunctionDeclaration:
                const func = this.createFunction(node);
                this.functions[node.identifier] = func;
                this.functionNodes[node.identifier] = node;
                break;
                
            case StatementType.VariableDeclaration:
                this.variables[node.identifier] = this.evaluate(node.value);
                break;

            case StatementType.PrintStatement:
                console.log(this.evaluate(node.value));
                break;

            case StatementType.IfStatement:
                if (this.evaluate(node.condition)) return this.evaluate(node.thenBranch);
                else if (node.elseBranch) return this.evaluate(node.elseBranch);
                return null;

            case StatementType.BlockStatement:
                for (const statement of (node.statements as Statement[])) {
                    const result = this.evaluate(statement);
                    if (result && result.type === `ReturnValue`) return result;
                }
                return null;

            case StatementType.BinaryExpression: {
                const left = this.evaluate(node.left);
                const right = this.evaluate(node.right);
        
                switch (node.operator) {
                    case `+`: 
                        if (typeof left === `string` || typeof right === `string`) return String(left) + String(right);
                        return left + right;
        
                    case `-`: return left - right;
                    case `*`: return left * right;
                    case `/`: return left / right;
                    case `<`: return left < right;
                    case `>`: return left > right;
                    case `<=`: return left <= right;
                    case `>=`: return left >= right;
                    case `==`: return left == right;
                    case `!=`: return left != right;
                }
            }

            // eslint-disable-next-line no-fallthrough
            case StatementType.Literal:
                return node.value;

            case StatementType.Identifier:
                if (Object.prototype.hasOwnProperty.call(this.variables, node.name)) return this.variables[node.name];
                else throw new Error(`'${node.name}' 가 선언되지 않았습니다.`);

            default:
                throw new Error(`알 수 없는 노드 타입: ${node.type}`);
        }
    }

    createFunction(node: any, functionName = null) {
        const func = (...args: any) => {
            const previousVariables = this.variables;
            this.variables = { ...this.variables };
    
            let argIndex = 0;
    
            node.params.elements.forEach((param: any) => {
                if (param.type === 'VariadicParameter') {
                    this.variables[param.value] = args.slice(argIndex);
                } else {
                    this.variables[param.value] = args[argIndex++];
                }
            });
    
            const result = this.evaluate(node.branch);
    
            this.variables = previousVariables;
    
            if (result && result.type === 'ReturnValue') {
                return result.value;
            }
            return null;
        };
    
        if (functionName) {
            Object.defineProperty(func, 'name', { value: functionName });
        }
    
        return func;
    }

    // 해석
    interpret() {
        this.ast.forEach(statement => this.evaluate(statement));
    }
}
