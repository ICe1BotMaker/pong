import { Lexer } from './lib/Lexer';
import { Parser } from './lib/Parser';
import { Interpreter } from './lib/Interpreter';

const code = `
var name = "ICe1";
print "Hello " + name + "!";
`;

const lexer = new Lexer(code);
const tokens = lexer.tokenize();

const parser = new Parser(tokens);
const ast = parser.parse();

const interpreter = new Interpreter(ast);
interpreter.interpret();
