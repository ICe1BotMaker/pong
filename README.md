## 🔮 Pong!
💻 어떻게 **스크립트 언어**를 만들까요?

`Lexer`, `Parser`, `Interpreter` 클래스에 대해 알아보고,<br />
본격적으로 스크립트 언어를 만들어봅시다.

<br />

> **Warning**
> 
> 지극히 저의 생각만을 정리해서 쓴 글입니다.<br />
> 혹시라도 잘못된 부분이 있다면 **PR** 남겨주시면 감사하겠습니다.

### 🎫 Lexer
렉서는, 작성된 코드를 **토큰화** 시켜줍니다.<br />
`예시: + -> PLUS`

### ⚖️ Parser
파서는, 토큰화된 코드를 **분석** 합니다.<br />
`예시: PLUS, PLUS -> INCREMENT_STATEMENT`

### ⌛️ Interpreter
인터프리터는, 분석된 코드를 **실행** 시켜줍니다.<br />
`예시: INCREMENT_STATEMENT -> (증가됨)`

<br />

## 🎓 개발 환경 세팅
우선 레포지토리를 클론 한 뒤, 라이브러리를 설치해줍니다.

```bash
$ git clone https://github.com/ICe1BotMaker/pong
```

```bash
$ npm install --save
```

<br />

설치가 완료된 디렉터리는 이러한 구조를 갖습니다.

```
└─ node_modules
└─ src
    └─ lib
        └─ Interpreter.ts
        └─ Lexer.ts
        └─ Parser.ts

    └─ types
        └─ interfaces.ts

    └─ index.ts

└─ eslint.config.mjs
└─ LICENSE
└─ package-lock.json
└─ package.json
└─ README.md
└─ tsconfig.json
```

<br />

## 🎬 시작하기

> **Warning**
>
> 주석을 최대한 달면서 코드를 작성해야합니다.<br />
>
> 괜히하는말이 아니라 나중되면 코드가 길어지기 떄문에<br />
> 적당한 구분이 필요합니다.

<br />

### 💈 문법 만들기

만약 `function` 이라는 키워드를 만들고싶다면

`src/types/interfaces.ts`

```ts
// ...

export enum TokenType {
    // ...
    FUNCTION = 'FUNCTION',
}

// ...
```

`src/lib/Lexer.ts`

```ts
// ...

public tokenizeIdentifier() {
    // ...
    if (value === 'function') return { type: TokenType.FUNCTION, value };
    // ...
}

// ...
```

이런식으로 하면 될 것이고, 이에 대한 문법을 지원하고싶다면

`src/types/interfaces.ts`

```ts
// ...

export enum StatementType {
    // ...
    FunctionDeclaration = 'FunctionDeclaration',
}

// ...
```

`src/lib/Parser.ts`

```ts
// ...

public parseStatement() {
    // ...
    if (token.type === TokenType.FUNCTION) return this.parseFunctionDeclaration();
    // ...
}

// ...

public parseFunctionDeclaration() {
    this.expect(TokenType.FUNCTION);
    const identifier = this.expect(TokenType.IDENTIFIER).value;
    const branch = this.parseBlock();
    this.expect(TokenType.SEMICOLON);

    return { type: StatementType.FunctionDeclaration, identifier, branch };
}

// ...
```

이렇게 하면 되겠죠? 이대로 실행시켜보면<br />
웬만해선 `Lexer`, `Parser` 클래스에서 오류가 발생하진 않는데,

`Interpreter` 클래스에선 오류가 발생하는 것을 알 수 있습니다.<br />그것도 아주 친절하게요.

```bash
알 수 없는 노드 타입: FunctionDeclaration
```

이 에러가 발생하는 이유는 `FunctionDeclaration` 에 대한<br />
노드 타입을 지정해주지 않았기 때문입니다.

따라서 우리는 `Interpreter` 클래스를 수정할 필요가 있습니다.

`src/lib/Interpreter.ts`

```ts
// ...

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

// ...

evaluate(node?: Statement): any {
    // ...
    
    switch (node.type) {
        // ...

        case StatementType.FunctionDeclaration:
            const func = this.createFunction(node);
            this.functions[node.identifier] = func;
            this.functionNodes[node.identifier] = node;
            break;

        // ...
    }
}

// ...
```

그 외 `ReturnValue` 나 `FunctionCall` 같은 스테이트먼트들은<br />
만들기 어렵다면 돈 내고 `o1-preview` 써서 만들어보시기 바랍니다.

<br />

### 💈 Vscode Language Server

저희는 이 스크립트 언어를 마음껏 즐기기 위해<br />
랭기지 서버를 만들 필요가 있습니다.

https://github.com/Ikuyadeu/generator-languageserver<br />
저는 이걸 참고해 만들었습니다.

<div style="margin-top: 35px;"></div>

#### 🎓 개발 환경 세팅

작업이 완료된 `src` 폴더를 한번 복사 해줍니다.<br />
(에러 검출 및 오브젝트 액세스 등에 대한 자동완성을 지원하기 위해)

<div style="margin-top: 35px;"></div>

#### 🤖 키워드 자동완성

일단 아래와 같이 쓸 키워드들을 정리해둡시다.

```ts
// ...

const keywords = [
	'if', 'else', 'function', 'var', 'print'
];

// ...
```

그 다음 `connection.onCompletion` 이벤트를 추가해줍니다.

```ts
// ...

connection.onCompletion(textDocumentPosition => {
    const document = documents.get(textDocumentPosition.textDocument.uri);
    if (!document) return [];

    const text = document.getText();
    const position = textDocumentPosition.position;
    const lines = text.split('\n');
    const line = lines[position.line];
    const prefix = line.substring(0, position.character);
    const words = prefix.split(/[\s;(){}]+/);
    const lastWord = words[words.length - 1];
    
    // 접두어에 따라 필터링
    const filteredKeywords = keywords.filter(keyword => keyword.startsWith(lastWord));

    const completions: CompletionItem[] = [
        ...filteredKeywords.map(keyword => ({
            label: keyword,
            kind: CompletionItemKind.Keyword,
            data: { type: 'keyword', value: keyword }
        })),
    ];

    return completions;
});

// ...
```

<br />

## 🎯 마치며
시간적인 여유가 나지 않아서 조금 많이 부족할 수도 있습니다.<br />
