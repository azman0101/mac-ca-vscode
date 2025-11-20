import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as tls from 'tls';

function initialize() {
  if (process.platform !== 'darwin') { 
    return;
  }

  const splitPattern = /(?=-----BEGIN\sCERTIFICATE-----)/g;
  const systemRootCertsPath = '/System/Library/Keychains/SystemRootCertificates.keychain';
  const args = ['find-certificate', '-a', '-p'];

  try {
    const trustedResult = childProcess.spawnSync('/usr/bin/security', args);
    const rootResult = childProcess.spawnSync('/usr/bin/security', [...args, systemRootCertsPath]);

    if (trustedResult.error) {
      console.error('Error fetching trusted certificates:', trustedResult.error);
    }
    if (rootResult.error) {
      console.error('Error fetching root certificates:', rootResult.error);
    }

    const allTrusted = trustedResult.stdout ? trustedResult.stdout.toString().split(splitPattern) : [];
    const allRoot = rootResult.stdout ? rootResult.stdout.toString().split(splitPattern) : [];
    const all = [...allTrusted, ...allRoot];

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
  } catch (err) {
    console.error('Failed to initialize mac-ca-vscode:', err);
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

export function deactivate() {}
