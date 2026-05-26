// This is a test file for the self-healing CI/CD pipeline
// It intentionally contains formatting and style issues

function addNumbers(a, b) {
	let sum	=	a + b	// Missing semicolon and mixed indentation
	return	sum
}

const unusedVariable = "This variable is never used"

const anotherUnusedVar = 42

// Extra trailing spaces above and inconsistent quotes
const message = 'Hello, world!'	// Single quotes when config expects double

// Deep indentation with tabs and spaces mixed
function processData(data) {
	if (data) {
		if (data.length > 0) {
			if (data[0] === 'valid') {
				let result	=	data.map(item => item.toUpperCase())
				return	result
			}
		}
	}
}

// Missing semicolon and extra spaces
const PI = 3.14159

// Trailing spaces and mixed quotes
const user = { name: "John", age: 30 }
