
const convertToFloat = (value)=> {
    let ans = ''
    if(typeof value === 'string')
   {
     ans = value.replace(/,/g, "");
     return parseFloat(ans)
   }
   return value
  }
  
  module.exports = convertToFloat;
   