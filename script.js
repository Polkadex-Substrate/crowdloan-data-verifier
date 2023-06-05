const axios = require('axios');
const fs = require('fs')
const parallel = require('./parallel.json')
const bifrost = require('./bifrost.json')
const convertToFloat = require('./convertToFloat')


const parallelTruncated = parallel.slice(0,5)



async function getAllData(url,address,contributions) {
  let allData = [];
  let currentPage = 0;
  let totalRows = 0;
  let rowsPerPage = 100; 
  
  try {
    while (true) {
        let param = JSON.stringify({
            "row": rowsPerPage,
            "page": currentPage,
            "address": address
          });
        const response = await axios.post(url,param , {
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': '8821dac3437c4a47a8aaa18acc82ea90'
            }
          });

      const data = response.data.data.transfers;
      allData.push(...data);
      totalRows += data.length;
      // console.log(response.data.data.count,'printing count');
      if (totalRows >= response.data.data.count) {
        break;
      }
    

      currentPage++;
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
return checkforTransfer(allData,address,"14AMZ3gw4tRsrdp78i4MmHZ8EFbXTMfuXGQMEC3t1GoqLboH",contributions)
}

// Usage
const apiUrl= 'https://polkadot.api.subscan.io/api/scan/transfers'

const endBlock = 10881400
const startBlock = 9743882
const checkforTransfer = (allData,from,to,contributions)=>{

  allData.sort((a, b) => {
    return a.amount - b.amount;
});
// console.log(allData.length,'printing lenght');

let amountSum = 0;
let valid = false
let reviewdObj = {from:from,to:to,totalAmount:0,blocks:[]}
for (let q = 0; q < allData.length; q++) {
  const obj = allData[q];
  const withinLimits = obj.block_num<=endBlock&&obj.block_num>=startBlock
  if(obj.from===from &&obj.to===to&&obj.block_num&&withinLimits)
 {
  amountSum = amountSum+parseFloat(parseFloat(obj.amount).toFixed(2))
  reviewdObj.blocks.push(obj.block_num)
 }
 
 if(amountSum>=convertToFloat(contributions))
 {
  valid = true
  reviewdObj.totalAmount = amountSum
  console.log(amountSum,'printing amount');
  break;
 }
}
if(valid)
{
  return reviewdObj
  
}
else
{
  console.log(from,'didnt contribute');
  return {}
}
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const reviewedData = []
const sendReqs = async()=>{
  for (let k = 0; k < bifrost.length; k++) {
    const element = bifrost[k];
    
  const data =  await getAllData(apiUrl,element.AccountId,element.Amount)
  reviewedData.push(data)
    await delay(250)
    
  }

  fs.writeFile('check.json', JSON.stringify(reviewedData,null,2), 'utf8', function(err) {
    if (err) {
        console.log('Some error occured - file either not saved or corrupted file saved.');
    } else {
        console.log('It\'s saved!');
    }
});
}
sendReqs()

// getAllData(apiUrl,"15gJZFJb7Gm8hPFR12Q7djCKX5rPv8SmJP61zdkc2S1o4n8g",5.2)
// console.log(parseFloat('124.00'));