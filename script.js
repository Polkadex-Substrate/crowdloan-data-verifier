const axios = require("axios");
const fs = require("fs");
const parallel = require("./parallel.json");
const bifrost = require("./bifrost.json");
const equilibrium = require("./equilibrium.json");
const convertToFloat = require("./convertToFloat");

const apiUrl = "https://polkadot.api.subscan.io/api/scan/transfers";
const endBlock = 10881400;
const startBlock = 9743882;
const destinationAddress = "14AMZ3gw4tRsrdp78i4MmHZ8EFbXTMfuXGQMEC3t1GoqLboH";

// function to fetch transfers for one single account
async function getAllData(url, sourceAddress, contributions) {
  let allData = [];
  let currentPage = 0;
  let totalRows = 0;
  let rowsPerPage = 100;

  try {
    while (true) {
      let param = JSON.stringify({
        row: rowsPerPage,
        page: currentPage,
        address: sourceAddress,
      });
      const response = await axios.post(url, param, {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "8821dac3437c4a47a8aaa18acc82ea90",
        },
      });

      const data = response.data.data.transfers;
      allData.push(...data);
      totalRows += data.length;
      if (totalRows >= response.data.data.count) {
        break;
      }
      currentPage++;
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
  return checkforTransfer(
    allData,
    sourceAddress,
    destinationAddress,
    contributions
  );
}

// function to check if the account made transfers to the particular address or not and return the object containing details like to,from,amount contributed and block
const checkforTransfer = (allData, from, to, contributions) => {
  allData.sort((a, b) => {
    return a.amount - b.amount;
  });

  let amountSum = 0;
  let valid = false;
  let reviewdObj = { from: from, to: to, totalAmount: 0, blocks: [] };
  for (let q = 0; q < allData.length; q++) {
    const obj = allData[q];
    const withinLimits =
      obj.block_num <= endBlock && obj.block_num >= startBlock;
    if (obj.from === from && obj.to === to && obj.block_num && withinLimits) {
      amountSum = amountSum + parseFloat(obj.amount);
      reviewdObj.blocks.push(obj.block_num);
    }

    if (parseFloat(amountSum.toFixed(2)) >= convertToFloat(contributions)) {
      valid = true;
      reviewdObj.totalAmount = amountSum;
      console.log(amountSum, "contributed");
      break;
    }
  }
  if (valid) {
    return reviewdObj;
  } else {
    console.log(from, "didnt contribute");
    return {};
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const reviewedData = [];

// function to check for every account in the file and push every object that contributed to an array
const mainFn = async () => {
  for (let k = 0; k < 10; k++) {
    const element = bifrost[k];

    const data = await getAllData(apiUrl, element.AccountId, element.Amount);

    // in element.AccountId and element.Amount , make sure to replace AccountId and Amount with the respective names from your file

    reviewedData.push(data);
    await delay(200);
  }
  writeToFile(reviewedData);
};

mainFn();

// function to print the final data in a separate file
const writeToFile = (data) => {
  fs.writeFile(
    "file.json",
    JSON.stringify(data, null, 2),
    "utf8",
    function (err) {
      if (err) {
        console.log(
          "Some error occured - file either not saved or corrupted file saved."
        );
      } else {
        console.log("It's saved!");
      }
    }
  );
};

// getAllData(apiUrl, "14wqYcJxV4zcYNNeHwSPFE1PgG9RLaHfwo5DjW1bUz6wKhZJ", 108.38);
// for checking if one single account contributed or not
