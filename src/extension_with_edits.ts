// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const keywords = [
	'SELECT', 'INSERT', 'UPDATE', 'DELETE',
	'FROM', 'UNION', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'INNER JOIN', 'OUTER JOIN',
	'WHERE', 'AND', 'ORDER BY', 'GROUP BY', 'OR'
]

const indentedKeyword = ['AND', 'OR']

const upperCase = (doc: vscode.TextDocument): vscode.TextEdit[] => {
	const edits: vscode.TextEdit[] = []
	for (let i = 0; i < doc.lineCount; i++) {
		keywords.forEach(keyword => {
			const r = new RegExp('\\b' + keyword + '\\b', "gi")
			let m: any
			while ((m = r.exec(doc.lineAt(i).text)) !== null) {
				const pos = m.index!
				if (doc.lineAt(i).text.substr(pos, keyword.length) !== keyword) {
					edits.push(vscode.TextEdit.replace(new vscode.Range(i, pos, i, pos + keyword.length), keyword))
				}
			}
		})
	}
	return edits
}

const spacingAroundEqualSign = (doc: vscode.TextDocument): vscode.TextEdit[] => {
	const edits: vscode.TextEdit[] = []
	for (let i = 0; i < doc.lineCount; i++) {
		const r = new RegExp('=', "g")
		let m: any
		while ((m = r.exec(doc.lineAt(i).text)) !== null) {
			if (m.index > 0) {
				if (doc.lineAt(i).text[m.index - 1] !== ' ') {
					edits.push(vscode.TextEdit.insert(new vscode.Position(i, m.index), ' '))
				}
				if (doc.lineAt(i).text.length > m.index + 1) {
					if (doc.lineAt(i).text[m.index + 1] !== ' ') {
						edits.push(vscode.TextEdit.insert(new vscode.Position(i, m.index + 1), ' '))
					}
				}
			}
		}
	}
	return edits
}

const extraSpaces = (doc: vscode.TextDocument): vscode.TextEdit[] => {
	const edits: vscode.TextEdit[] = []
	for (let i = 0; i < doc.lineCount; i++) {
		// the space after comma rule interferes with this one (?<!y)x
		const r = new RegExp('\\s+', "g")
		let m: any
		while ((m = r.exec(doc.lineAt(i).text)) !== null) {
			console.log(`found >${m[0]}<`)
			if (m[0].length > 1) {
				edits.push(vscode.TextEdit.replace(new vscode.Range(i, m.index, i, m.index + m[0].length), ' '))
			}
		}
	}
	return edits
}

const spaceAfterComma = (doc: vscode.TextDocument): vscode.TextEdit[] => {
	const edits: vscode.TextEdit[] = []
	for (let i = 0; i < doc.lineCount; i++) {
		const r = new RegExp(',', "g")
		let m: any
		while ((m = r.exec(doc.lineAt(i).text)) !== null) {
			console.log(`found ${m[0]}`)
			if (m[0].length > 2 || m[0].length === 1) {
				edits.push(vscode.TextEdit.replace(new vscode.Range(i, m.index, i, m.index + m[0].length), ', '))
			}
		}
	}
	return edits
}

const newLines = (doc: vscode.TextDocument): vscode.TextEdit[] => {
	const edits: vscode.TextEdit[] = []
	for (let i = 0; i < doc.lineCount; i++) {
		keywords.forEach(keyword => {
			const r = new RegExp('\\b' + keyword + '\\b', "gi")
			let m: any
			while ((m = r.exec(doc.lineAt(i).text)) !== null) {
				const pos = m.index!
				// are there any non whitespace characters before pos?
				// if so insert a newline
				let prefix = doc.lineAt(i).text.substr(0, pos - 1)
				if (prefix && prefix.trim()) {
					if (indentedKeyword.indexOf(keyword) !== -1) {
						edits.push(vscode.TextEdit.insert(new vscode.Position(i, pos), '\n\t'))
					} else {
						edits.push(vscode.TextEdit.insert(new vscode.Position(i, pos), '\n'))
					}
				}
			}
		})
	}
	return edits
}

const apply = (document: vscode.TextDocument, edits: vscode.TextEdit[]) => {
	const workEdits = new vscode.WorkspaceEdit();
	workEdits.set(document.uri, edits); // give the edits
	vscode.workspace.applyEdit(workEdits); // apply the edits
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('sss extension activated')
	// // The command has been defined in the package.json file
	// // Now provide the implementation of the command with registerCommand
	// // The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('sss.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello VS Code!');
	// });

	// context.subscriptions.push(disposable);
	vscode.languages.registerDocumentFormattingEditProvider('sql', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			console.log(document.getText())
			let edits: vscode.TextEdit[] = []
			edits = edits.concat(spacingAroundEqualSign(document))
			edits = edits.concat(upperCase(document))
			edits = edits.concat(spaceAfterComma(document))
			edits = edits.concat(extraSpaces(document))
			edits = edits.concat(newLines(document))
			console.log(`found ${edits.length} formatting fixes`)
			return edits
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
