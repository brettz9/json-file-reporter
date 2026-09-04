/**
 * @param {number} num1
 * @param {number} num2
 * @throws {TypeError}
 * @returns {number}
 */
function add (num1, num2) {
  if (typeof num1 !== 'number') {
    throw new TypeError(`type of ${num1} is not number.`);
  }
  if (typeof num2 !== 'number') {
    throw new TypeError(`type of ${num2} is not number.`);
  }
  return num1 + num2;
}

export default add;
