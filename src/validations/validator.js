
const isValidValue = function (value) {
    if (typeof value === "undefined" || value === null) return false; 
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidString = function (value) {
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidDetails = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};
  
  
module.exports.isValidValue = isValidValue;
module.exports.isValidDetails = isValidDetails;
module.exports.isValidString = isValidString;
