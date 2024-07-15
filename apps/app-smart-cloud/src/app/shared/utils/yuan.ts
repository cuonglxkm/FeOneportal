import {
  GpuConfigRecommend,
  OfferItem,
} from 'src/app/pages/instances/instances.model';

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

  return { regionId, projectId };
}

export function getUniqueObjects(array, key) {
  return Object.values(
    array.reduce((acc, current) => {
      acc[current[key]] = current;
      return acc;
    }, {})
  );
}

export function getListGpuConfigRecommend(
  listGpuType: OfferItem[]
): GpuConfigRecommend[] {
  let result: GpuConfigRecommend[] = [];

  listGpuType.forEach((item) => {
    let id = item.id;
    let configs = item.characteristicValues.filter((cv) => cv.type === 3);

    configs.forEach((config) => {
      let gpuCount = parseInt(config.charName, 10);
      let cpu =
        config.charOptionValues[0] == 'CPU'
          ? parseInt(config.charOptionValues[1], 10)
          : 0;
      let ram =
        config.charOptionValues[0] == 'RAM'
          ? parseInt(config.charOptionValues[1], 10)
          : 0;
      let ssd =
        config.charOptionValues[0] == 'SSD'
          ? parseInt(config.charOptionValues[1], 10)
          : 0;

      result.push(new GpuConfigRecommend(gpuCount, ssd, ram, cpu, id));
    });
  });

  const tempData: { [key: string]: any } = {};

  result.forEach((item) => {
    const key = `${item.gpuCount}-${item.id}`;

    if (!tempData[key]) {
      tempData[key] = { ...item };
    } else {
      tempData[key].ssd += item.ssd;
      tempData[key].ram += item.ram;
      tempData[key].cpu += item.cpu;
    }
  });

  return Object.values(tempData);
}
