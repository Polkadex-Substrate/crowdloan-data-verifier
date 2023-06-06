# crowdloan-data-verifier
Script to verify that the accounts in the sheets have contributed to the crowdloan

### How to run
To run the Node.js code, you need to have Node.js installed on your system.  

Follow these steps to run the script:

- Clone the project
- Run "npm i" on the terminal
- Locate the json file you want to run the script on and copy it to the project's directory
- In the script.js file ,import the json file you want to run the script on, ensure the data is in json format.  
   Hers is an example -  
   `const bifrost = require("./bifrost.json");`
- Replac the destination address witht the your destination address `const destinationAddress = "your destination address";`
- Replace the file name here in the mainFn function with the file name you imported. 
 
  `const mainFn = async () => {
   for (let k = 0; k < bifrost.length; k++) {
   const element = bifrost[k];  
  };`. 
- Run "node script.js"
- For all the accounts that contributed, the scripts prints "amount contributed" on the terminal and "account id didnt contribute" for the accounts which didnt contribute.
- At the end all the reviewed accounts who contribute get stored in a new json file (check.json) with their details.
- You will be able to see a check.json file in the project directory.
 
