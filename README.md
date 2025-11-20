# Mac CA VS Code

Make all certificates in Keychain Access available to VS Code extensions.

## Features

This extension injects certificates from the macOS Keychain into the Node.js TLS context used by VS Code extensions. This allows self-signed certificates (e.g., for corporate proxies or internal servers) to be trusted by other extensions.

It replaces `tls.createSecureContext` with a custom implementation that loads certificates from the System and User Keychains.

## Installation

Install from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=azman0101.mac-ca-vscode) or:
1. Open VS Code
2. Press `Cmd+Shift+X` (Extensions pane)
3. Search for `mac-ca-vscode`
4. Click `Install`

## Requirements

- macOS (The extension does nothing on other platforms)
- VS Code 1.74.0 or later

## Usage

The extension works automatically upon activation. No configuration is required.
**Note:** You must restart VS Code after installing the extension for the changes to take effect.

## Troubleshooting

If you still encounter certificate errors:
1. Ensure the certificate is trusted in Keychain Access.
2. Restart VS Code completely.
3. Check the Developer Tools console (Help -> Toggle Developer Tools) for any errors from this extension.

## Credits

- [win-ca](https://github.com/ukoloff/win-ca)
- [mac-ca](https://github.com/jfromaniello/mac-ca)

## License

MIT
