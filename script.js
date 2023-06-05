const axios = require("axios");
const fs = require("fs");
const parallel = require("./parallel.json");
const bifrost = require("./bifrost.json");
const equilibrium = require("./equilibrium.json");
const convertToFloat = require("./convertToFloat");
const trunc = equilibrium.splice(1, 10);

const apiUrl = "https://polkadot.api.subscan.io/api/scan/transfers";
const endBlock = 10881400;
const startBlock = 9743882;

// function to fetch transfers for one single account
async function getAllData(url, address, contributions) {
  let allData = [];
  let currentPage = 0;
  let totalRows = 0;
  let rowsPerPage = 100;

  try {
    while (true) {
      let param = JSON.stringify({
        row: rowsPerPage,
        page: currentPage,
        address: address,
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
    address,
    "13rWYJ2DWj4ZQrZWfVJRJXqVSaQfd34QmRJrsJdSsApnnmK",
    contributions
  );
}

// function to check if the account made transfers to the particular address or not
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

// function to check for every account in the file
const mainFn = async () => {
  for (let k = 0; k < trunc.length; k++) {
    const element = trunc[k];

    const data = await getAllData(apiUrl, element.AccountId, element.Amount);
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
