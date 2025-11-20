import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as tls from 'tls';

let outputChannel: vscode.OutputChannel;

function initialize() {
  outputChannel = vscode.window.createOutputChannel('Mac CA VSCode');
  outputChannel.appendLine('Mac CA VSCode: Initialization started.');

  if (process.platform !== 'darwin') { 
    outputChannel.appendLine('Mac CA VSCode: Platform is not darwin. Skipping.');
    return;
  }

  const splitPattern = /(?=-----BEGIN\sCERTIFICATE-----)/g;
  const systemRootCertsPath = '/System/Library/Keychains/SystemRootCertificates.keychain';
  const args = ['find-certificate', '-a', '-p'];

  try {
    const trustedResult = childProcess.spawnSync('/usr/bin/security', args);
    const rootResult = childProcess.spawnSync('/usr/bin/security', [...args, systemRootCertsPath]);

    if (trustedResult.error) {
      outputChannel.appendLine(`Error fetching trusted certificates: ${trustedResult.error.message}`);
    }
    if (rootResult.error) {
      outputChannel.appendLine(`Error fetching root certificates: ${rootResult.error.message}`);
    }

    const allTrusted = trustedResult.stdout ? trustedResult.stdout.toString().split(splitPattern) : [];
    const allRoot = rootResult.stdout ? rootResult.stdout.toString().split(splitPattern) : [];
    const all = [...allTrusted, ...allRoot];

    outputChannel.appendLine(`Found ${allTrusted.length} trusted certificates and ${allRoot.length} root certificates.`);

    const origCreateSecureContext = tls.createSecureContext;
    (tls as any).createSecureContext = (options: tls.SecureContextOptions) => {
      const ctx = origCreateSecureContext(options);
      const distinctCerts = all.filter(filterDuplicates);

      distinctCerts.forEach((cert: string) => {
        const trimmedCert = cert.trim();
        if (trimmedCert) {
            try {
              // Accessing internal context to add CA cert
              (ctx as any).context.addCACert(trimmedCert);
            } catch {
              // Ignore invalid certs or add errors
            }
        }
      });
      return ctx;
    };
    outputChannel.appendLine('Mac CA VSCode: TLS patched successfully.');
  } catch (err) {
    outputChannel.appendLine(`Failed to initialize mac-ca-vscode: ${err}`);
  }
}

function filterDuplicates(cert: string, index: number, arr: string[]) {
  return arr.indexOf(cert) === index;
}

// Execute initialization
initialize();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(_context: vscode.ExtensionContext) {
  // Extension is active
}

export function deactivate() {
  if (outputChannel) {
    outputChannel.dispose();
  }
}
