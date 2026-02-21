export const initialPages = [
    {
        id: 'page1',
        title: 'Technical Research & Post-Mortems',
        icon: '📘',
        cover: null,
        parentId: null,
        blocks: [
            { id: '1', type: 'h1', content: 'Technical Research & Post-Mortems', focused: false },
            { id: '2', type: 'p', content: 'This is my internal knowledge base where I drop quick notes and technical breakdowns of things I build.', focused: false },
            { id: '3', type: 'code', content: "function helloWorld() {\n  console.log('Syntax Highlighting built right in!');\n}", focused: false },
            { id: '4', type: 'p', content: 'Try out the Math Blocks using KaTeX too:', focused: false },
            { id: '5', type: 'math', content: "f(a) = \\frac{1}{2\\pi i} \\oint\\frac{f(z)}{z-a}dz", focused: false },
            { id: '6', type: 'p', content: 'Try typing / to see the command menu!', focused: true }
        ]
    },
    {
        id: 'page2',
        title: 'AML Modeling Notes',
        icon: '🛡️',
        cover: null,
        parentId: null,
        blocks: [
            { id: '1', type: 'h1', content: 'Anti-Money Laundering Algorithms', focused: false },
            { id: '2', type: 'p', content: 'Notes regarding network graph optimization.', focused: true }
        ]
    }
];
