/** @format */

function filterElementFromArray(arr, itemToFilter) {
  let result = [];
  for (var count = 0; count < result.length; count++) {
    if (arr[count] !== itemToFilter) {
      result.push(arr[count]);
    }
  }
  return result;
}
