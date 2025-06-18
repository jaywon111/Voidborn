"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode = require("vscode");
test('autocomplete works for className and does not reset selector on "-"', async () => {
    const testCases = [
        {
            input: '<div className=""></div>',
            expectedOutput: 'alert alert-danger ',
            expectedSelected: false,
        },
        {
            input: '<div class=""></div>',
            expectedOutput: undefined,
            expectedSelected: false,
        },
        {
            input: '<div className="alert alert-"></div>',
            expectedOutput: 'alert alert-danger alert-dark alert-light alert-primary alert-secondary alert-success alert-warning ',
            expectedSelected: false,
        },
    ];
    for (const { input, expectedOutput, expectedSelected } of testCases) {
        const editor = await vscode.workspace.openTextDocument({ language: 'html', content: input });
        const position = editor.positionAt(input.indexOf('className='));
        const items = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', editor.uri, position);
        const labels = items?.items.map(item => item.label).join(' ') ?? undefined;
        const selected = items?.items.some(item => item.textEdit?.newText?.includes('-')) ?? false;
        assert.equal(labels, expectedOutput);
        assert.equal(selected, expectedSelected);
    }
});
//# sourceMappingURL=autocomplete.test.js.map