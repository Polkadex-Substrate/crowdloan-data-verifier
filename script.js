const axios = require("axios");
const fs = require("fs");
const parallel = require("./parallel.json");
const bifrost = require("./bifrost.json");
const equilibrium = require("./equilibrium.json");
const convertToFloat = require("./convertToFloat");

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

// Usage
const apiUrl = "https://polkadot.api.subscan.io/api/scan/transfers";

const endBlock = 10881400;
const startBlock = 9743882;
const checkforTransfer = (allData, from, to, contributions) => {
  allData.sort((a, b) => {
    return a.amount - b.amount;
  });
  // console.log(allData.length,'printing lenght');

  let amountSum = 0;
  let valid = false;
  let reviewdObj = { from: from, to: to, totalAmount: 0, blocks: [] };
  for (let q = 0; q < allData.length; q++) {
    const obj = allData[q];
    const withinLimits =
      obj.block_num <= endBlock && obj.block_num >= startBlock;
    if (obj.from === from && obj.to === to && obj.block_num && withinLimits) {
      // amountSum = amountSum + parseFloat(parseFloat(obj.amount).toFixed(2));
      amountSum = amountSum + parseFloat(obj.amount);
      // console.log(obj.amount);
      // console.log(parseFloat(amountSum.toFixed(2)));
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
const sendReqs = async () => {
  for (let k = 0; k < equilibrium.length; k++) {
    const element = equilibrium[k];

    const data = await getAllData(apiUrl, element.AccountId, element.Amount);
    reviewedData.push(data);
    await delay(200);
  }

  fs.writeFile(
    "check.json",
    JSON.stringify(reviewedData, null, 2),
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
sendReqs();

// getAllData(apiUrl, "14wqYcJxV4zcYNNeHwSPFE1PgG9RLaHfwo5DjW1bUz6wKhZJ", 108.38);
// console.log(parseFloat('124.00'));

// 15VY44qZsz7e3YSmXMXAkpZ2qjoCE9RSM6sh3nY7g79cyWJC
// 14wqYcJxV4zcYNNeHwSPFE1PgG9RLaHfwo5DjW1bUz6wKhZJ
// 1ZBxptd5AxFxRts68TB63TZAVq6enxzbEjPpd6cUdBgWBz5
