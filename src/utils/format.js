/**
 * 判断一个变量是否是数字
 * @param {String | Number} n 需要判断的变量
 * @returns {Boolean}
 */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * 数字格式化
 * @param {string | number | null | undefined} n 需要被格式化的参数
 * @param {number} presion 需要保留的精度
 * @param {string} replacer 替换的字符串
 * @returns {string}
 */
export function numFormat(n, precis = 2, replacer= "-") {
    // console.debug(n, isNumber(n))
    return isNumber(n) ? n.toFixed(precis) : replacer;
}