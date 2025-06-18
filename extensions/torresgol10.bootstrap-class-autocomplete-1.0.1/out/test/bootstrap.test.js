"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode = require("vscode");
suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Test activate function', async () => {
        // Simulate the extension activation event
        vscode.extensions.getExtension('bootstrap-class-autocomplete').activate();
        // Test that the extension command was registered
        const commands = await vscode.commands.getCommands();
        assert.ok(commands.includes('bootstrap-class-autocomplete.bootstrapClassAutocomplete'));
        // Test the completion item provider
        const document = await vscode.workspace.openTextDocument({
            language: 'html',
            content: '<div class=""></div>'
        });
        const position = new vscode.Position(0, 11);
        const completionItems = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', document.uri, position);
        assert.ok(completionItems && completionItems.items.length > 0);
        // Test the status bar item
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        assert.strictEqual(statusBarItem.text, '');
        await vscode.commands.executeCommand('extension.selectBootstrapVersion');
        assert.strictEqual(statusBarItem.text, '5.3.0-alpha2');
    });
    vscode.window.showInformationMessage('All tests finished.');
});
//# sourceMappingURL=bootstrap.test.js.map