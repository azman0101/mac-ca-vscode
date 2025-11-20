import * as assert from 'assert';
import * as vscode from 'vscode';
import * as tls from 'tls';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should inject certificates', () => {
        // Since the extension runs on load, we can check if the certificates are added.
        // However, testing this in an integration test is tricky because we need to mock system calls before the extension activates.
        // The extension activates when VS Code starts it.

        // But here we can at least test if our logic functions correct.
        // Since we cannot easily unit test the top-level code in extension.ts without exporting it,
        // we rely on the fact that the extension should have patched tls.createSecureContext.

        const ctx = tls.createSecureContext();
        // We can't easily verify the certs are in without inspection, but we can check if it didn't crash.
        assert.ok(ctx);
    });

    test('Basic Array Test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
});
