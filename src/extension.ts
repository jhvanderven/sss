// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const keywords = [
	'FROM', 'UNION', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'INNER JOIN', 'OUTER JOIN',
	'SET',
	'WHERE', 'AND', 'ORDER BY', 'GROUP BY', 'OR'
]

const statementStartingKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP']

const indentedKeywords = ['AND', 'OR']

const sameLineKeywords = ['ON']

const insertAt = (input: string, what: string, at: number): string => {
	if (at < 0) {
		return input
	}
	return input.substr(0, at) + what + input.substr(at + 1)
}

const removeAt = (input: string, remove: string, replace: string, at: number): string => {
	return input.substr(0, at) + replace + input.substr(at + remove.length)
}

const replaceAt = (input: string, what: string, at: number): string => {
	let answer = input
	for (let i = 0; i < what.length; i++) {
		answer = replaceCharAt(at + i, answer, what[i])
	}
	return answer
}

const replaceCharAt = (index: number, str: string, replacement: string): string => {
	if (index >= str.length) {
		return str
	}

	var chars = str.split('');
	chars[index] = replacement;
	return chars.join('');
}

const upperCase = (doc: string): string => {
	const lines = doc.split('\n')
	for (let i = 0; i < lines.length; i++) {
		statementStartingKeywords.forEach(keyword => {
			upperCaseKeyWord(keyword, lines, i);
		})

		keywords.forEach(keyword => {
			upperCaseKeyWord(keyword, lines, i);
		})

		sameLineKeywords.forEach(keyword => {
			upperCaseKeyWord(keyword, lines, i);
		})
	}
	return lines.join('\n')
}

const spacingAroundEqualSign = (doc: string): string => {
	const lines = doc.split('\n')
	for (let i = 0; i < lines.length; i++) {
		const r = new RegExp('=', "g")
		let m: any
		while ((m = r.exec(lines[i])) !== null) {
			let inserted = 0
			if (m.index > 0) {
				if (lines[i][m.index - 1] !== ' ') {
					lines[i] = insertAt(lines[i], ' =', m.index)
					inserted = 1
				}
				if (lines[i].length > m.index + 1 + inserted) {
					if (lines[i][m.index + 1 + inserted] !== ' ') {
						lines[i] = insertAt(lines[i], '= ', m.index + inserted)
					}
				}
			}
		}
	}
	return lines.join('\n')
}

const extraSpaces = (doc: string): string => {
	const lines = doc.split('\n')
	for (let i = 0; i < lines.length; i++) {
		const r = new RegExp('\\s+', "g")
		let m: any, removed: number = 0
		let ms: any = []
		while ((m = r.exec(lines[i])) !== null) {
			ms.push(m)
		}
		for (let j = ms.length - 1; j >= 0; j--) {
			m = ms[j]
			if (m[0].length > 1) {
				lines[i] = removeAt(lines[i], m[0], ' ', m.index)
			}
		}
	}
	return lines.join('\n')
}

const spaceAfterComma = (doc: string): string => {
	const lines = doc.split('\n')
	for (let i = 0; i < lines.length; i++) {
		const r = new RegExp(',', "g")
		let m: any
		while ((m = r.exec(lines[i])) !== null) {
			console.log(`found ${m[0]}`)
			if (m[0].length > 2 || m[0].length === 1) {
				lines[i] = insertAt(lines[i], ', ', m.index)
			}
		}
	}
	return lines.join('\n')
}

const removeTrailingSpaces = (doc: string): string => {
	const lines = doc.split('\n')
	for (let i = 0; i < lines.length; i++) {
		const r = new RegExp('\\s$', "g")
		let m: any
		while ((m = r.exec(lines[i])) !== null) {
			console.log(`found >>${m[0]}<<`)
			lines[i] = removeAt(lines[i], m[0], '', m.index)
		}
	}
	return lines.join('\n')
}

const newLines = (doc: string): string => {
	let ms: any = []
	if (doc.length < 60) {
		return doc
	}
	keywords.forEach(keyword => {
		const r = new RegExp('\\b' + keyword + '\\b', "gi")
		let m: any
		while ((m = r.exec(doc)) !== null) {
			ms.push(m)
		}
	})
	for (let j = ms.length - 1; j >= 0; j--) {
		let m = ms[j]
		const pos = m.index!
		// are there any non whitespace characters before pos?
		// if so insert a newline
		let i = pos - 1
		while (i > 0 && doc[i] !== '\n' && doc[i] !== '\r') {
			i--
		}
		let prefix = doc.substring(i, pos - 1)
		console.log(`in front of keyword ${m[0]} there is ${prefix}`)
		if (prefix && prefix.trim()) {
			if (indentedKeywords.indexOf(m[0]) !== -1) {
				doc = insertAt(doc, '\n\t', pos - 1)
			} else {
				doc = insertAt(doc, '\n', pos - 1)
			}
		}
	}
	return doc
}

function upperCaseKeyWord(keyword: string, lines: string[], i: number) {
	const r = new RegExp('\\b' + keyword + '\\b', "gi");
	let m: any;
	while ((m = r.exec(lines[i])) !== null) {
		const pos = m.index!;
		if (lines[i].substr(pos, keyword.length) !== keyword) {
			lines[i] = replaceAt(lines[i], keyword, pos);
		}
	}
}

const newLineBetweenStatements = (doc: string): string => {
	if (doc[doc.length - 1] !== '\n') {
		doc = doc + '\n\n'
	} else if (doc[doc.length - 2] !== '\n') {
		doc = doc + '\n'
	}
	return doc
}

const insertComment = (doc: string): string => {
	return `-- Purpose:\n${doc}`
}

const camelCased = (s: string): string => {
	// no idea yet but to make the first letter lowercase
	let result = '@' + s[1].toLowerCase() + (s.length > 2) ? s.substr(2) : ''
	return result
}

const variablesToCamelCase = (doc: string): string => {
	const r = new RegExp('\\B@\\w+', "g");
	let m: any;
	while ((m = r.exec(doc)) !== null) {
		const pos = m.index!;
		console.log(doc, m[0])
		if (doc.substr(pos, m[0].length) !== camelCased(m[0])) {
			doc = replaceAt(doc, camelCased(m[0]), pos);
		}
	}
	return doc
}

const getStatements = (doc: string): string[] => {
	let result: string[] = []
	//console.log(statementStartingKeywords.join('|'))
	const r = new RegExp(`\\b(${statementStartingKeywords.join('|')})\\b`, "gi");
	let m: any, ms: any = []
	while ((m = r.exec(doc)) !== null) {
		//console.log(`found ${m[0]} at ${m.index}`)
		ms.push(m)
	}
	for (let i = 0; i < ms.length - 1; i++) {
		result.push(doc.substr(ms[i].index, ms[i + 1].index - ms[i].index))
	}
	result.push(doc.substr(ms[ms.length - 1].index))
	//console.log(result)
	return result
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
			let result = ''
			let edits: vscode.TextEdit[] = []
			let text = document.getText()
			let statements = getStatements(text)
			console.log(statements)
			statements.forEach(text => {
				text = spacingAroundEqualSign(text)
				text = variablesToCamelCase(text)
				text = upperCase(text)
				text = spaceAfterComma(text)
				text = extraSpaces(text)
				text = newLines(text)
				text = newLineBetweenStatements(text)
				text = removeTrailingSpaces(text)
				text = insertComment(text)
				console.log(text)
				result += text
			})
			edits.push(vscode.TextEdit.replace(new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length), result))
			return edits
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
