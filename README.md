# crowdloan-data-verifier
Script to verify that the accounts in the sheets have contributed to the crowdloan

### How to run
- Clone the project
- Run npm i
- Import the json file you want to run the script on in the script.js file .  
 
   `const bifrost = require("./bifrost.json");`
 
- Replace the file name here with the file name you imported.  
`const mainFn = async () => {
for (let k = 0; k < bifrost.length; k++) {
 const element = bifrost[k];  
};`. 
- Run script.js
 
