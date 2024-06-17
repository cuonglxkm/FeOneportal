/**
 * 转化成RMB元字符串
 *
 * @param digits 当数字类型时，允许指定小数点后数字的个数，默认2位小数
 */
export function yuan(value: number | string, digits: number = 2): string {
  if (typeof value === 'number') {
    value = value.toFixed(digits);
  }
  return `&yen ${value}`;
}


export function getCurrentRegionAndProject() {

  let regionId = null;
  let projectId = null;
  if (localStorage.getItem('regionId') != null) {
    regionId = JSON.parse(localStorage.getItem('regionId'));
  }
  if (localStorage.getItem('projectId') != null) {
    projectId = JSON.parse(localStorage.getItem('projectId'));
  }

  return {regionId, projectId};
}


export function getUniqueObjects(array, key) {
  return Object.values(array.reduce((acc, current) => {
    acc[current[key]] = current;
    return acc;
  }, {}));
}