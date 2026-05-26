// Test file for self-healing CI/CD pipeline
// Contains both format and lint violations

const badSpacing =1+2
const message = 'single quotes bad'

function test( ){
  if (badSpacing>2){
console.log(message)
  }
}

export { test }
