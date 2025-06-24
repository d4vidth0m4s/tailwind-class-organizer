import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('tailwind-class-organizer.organize', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No hay editor activo.");
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection.isEmpty
      ? editor.document.getWordRangeAtPosition(selection.start, /class(Name)?="[^"]+"/)
      : selection);

    const match = selectedText.match(/class(Name)?="([^"]+)"/);
    if (!match) {
      vscode.window.showErrorMessage("No se encontró un atributo className o class.");
      return;
    }

    const classString = match[2];
    const classList = classString.trim().split(/\s+/);

    // Organización simple por prefijo
    const groups: { [key: string]: string[] } = {};

    for (const cls of classList) {
      const prefix = cls.includes(":") ? cls.split(":")[0] + ":" : "base";
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(cls);
    }

    // Construcción del HTML
    let formatted = "";
    for (const prefix in groups) {
      formatted += groups[prefix].join(" ") + "\n";
    }

    const panel = vscode.window.createWebviewPanel(
      'tailwindClassViewer',
      'Tailwind Class Organizer',
      vscode.ViewColumn.Beside,
      {}
    );

    panel.webview.html = getWebviewContent(formatted);
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: monospace;
          padding: 16px;
        }
        pre {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <h2>Clases organizadas</h2>
      <pre><code>${content}</code></pre>
    </body>
    </html>
  `;
}

export function deactivate() {}
