function sigmod(x) {
  return 1 / (1 + Math.exp(-x));
}

const tables = new Map([
  [
    "果木村",
    [
      // [水位, 淹没公路, 淹没民房, 淹没范围, 淹没农用地范围, 淹没耕地]
      ["198.4", 0, 0, 1037.82, 0, 0],
      ["199.0", 355.34, 0, 1101.17, 63.35, 20.08],
      ["199.5", 355.34, 0, 1355.33, 317.51, 263.22],
      ["200.0", 2040.75, 2, 1899.31, 861.49, 537.55],
      ["200.6", 4077.34, 8, 2778.63, 1740.81, 1425.36],
    ],
  ],
  [
    "过埠镇",
    [
      ["198.4", 0, 0, 2110.97635, 0, 0],
      ["199.0", 276.31, 0, 2189.156972, 78.18062219, 38.50619807],
      ["199.5", 3632.39, 6, 2758.745875, 647.7695252, 115.9245392],
      ["200.0", 3938.36, 11, 2992.362352, 881.3860023, 149.3975775],
      ["200.6", 7067.94, 96, 3470.415916, 1359.439567, 245.3681127],
    ],
  ],
  [
    "河梅村",
    [
      ["198.4", 0, 0, 220.9921864, 33.4091173, 33.4091173],
      ["199.0", 0, 0, 267.0343446, 76.0422445828277, 91.61303034],
      ["199.5", 407.6, 0, 301.312754, 113.320654043623, 102.0583986],
      ["200.0", 962.77, 3, 406.0697693, 218.077669315115, 113.1341869],
      ["200.6", 1437.07, 37, 452.7455226, 264.753422577239, 124.5119908],
    ],
  ],
  [
    "杰坝乡",
    [
      ["198.4", 0, 0, 354.2427246, 0, 0],
      ["199.0", 0, 0, 364.577437, 10.33471238, 0],
      ["199.5", 175.44, 4, 421.5414699, 67.29874525, 0],
      ["200.0", 271.92, 28, 451.2582706, 97.01554599, 0],
      ["200.6", 607.31, 55, 468.5548184, 114.3120937, 0],
    ],
  ],
  [
    "龙下村",
    [
      ["198.4", 0, 0, 805.124914743754, 0, 0],
      ["199.0", 0, 0, 830.140353492982, 25.01543875, 0],
      ["199.5", 0, 0, 1027.60766361962, 222.4827489, 78.78515271],
      ["200.0", 1591.55, 12, 1907.70332461483, 1102.57841, 89.98708336],
      ["200.6", 2169.84, 15, 1952.54046737298, 1147.415553, 108.0559603],
    ],
  ],
  [
    "水岩乡",
    [
      ["198.4", 0, 0, 5954.98905750547, 0, 0],
      ["199.0", 0, 0, 5992.124104, 37.13504643, 16.96195072],
      ["199.5", 185.21, 2, 6223.595033, 268.6059757, 29.35340147],
      ["200.0", 2652.47, 15, 6768.196266, 813.2072084, 66.72347199],
      ["200.6", 4111.57, 188, 6960.368295, 1005.379237, 79.61456574],
    ],
  ],
  [
    "营前镇",
    [
      ["198.4", 0, 0, 399.949075025462, 0, 0],
      ["199.0", 0, 0, 493.7485731, 93.7994981, 0],
      ["199.5", 0, 1, 522.5623887, 122.6133137, 0],
      ["200.0", 0, 5, 572.2499089, 172.3008338, 0],
      ["200.6", 5199.31, 145, 2208.135261, 1808.186186, 192.0821571],
    ],
  ],
]);

function getDataForTable(tables, fieldName) {
  // 遍历表的每一行
  for (const row of tables) {
    // 判断当前行的水位是否为199.5
    if (row[0] === fieldName) {
      // 返回第三列（淹没民房数）
      return row;
    }
  }
  // 若未找到匹配行，返回空数组
  return [];
}

function getSumOfFieldRows(tables, fieldName) {
  const result = []; // 存储每个位置的和
  const tableNames = [...tables.keys()]; // 需处理的表名

  // 遍历a、b、c表，提取199.5行数据
  const rows = tableNames.map((tableName) => {
    const tableData = tables.get(tableName);
    for (const row of tableData) {
      if (row[0] === fieldName) {
        return row; // 找到199.5行，返回该行数据
      }
    }
    return []; // 若未找到，返回空数组（不影响求和）
  });

  // 计算每个位置的和
  for (let i = 0; i < rows[0].length; i++) {
    // 假设a、b、c列数一致
    let sum = 0;
    for (const row of rows) {
      sum += row[i]; // 累加对应位置的值
    }
    result.push(sum);
  }

  return result;
}

function getSumOfEachWaterLevel(tables) {
  const result = new Map(); // 存储结果（水位 → 每个位置的和）
  const tableNames = [...tables.keys()]; // 需处理的表名

  // 遍历a、b、c表，提取所有行数据
  const allRows = tableNames.flatMap((tableName) => {
    return tables.get(tableName); // 获取表的行数据并展开
  });

  // 对所有行按水位分组
  const groupedByWaterLevel = new Map();
  for (const row of allRows) {
    const waterLevel = row[0]; // 水位（第一列）
    if (!groupedByWaterLevel.has(waterLevel)) {
      groupedByWaterLevel.set(waterLevel, []); // 初始化水位对应的行数组
    }
    groupedByWaterLevel.get(waterLevel).push(row); // 将行加入对应水位的数组
  }

  // 计算每个水位的每个位置的和
  for (const [waterLevel, rows] of groupedByWaterLevel) {
    const sum = [];
    //  const sum = [];
    // for (let i = 1; i < rows[0].length; i++) {
    //   // 从第2列开始（第1列是水位，无需求和）
    //   let positionSum = 0;
    //   for (const row of rows) {
    //     positionSum += row[i]; // 累加对应位置的值
    //   }
    //   sum.push(positionSum);
    // }
    // result.set(waterLevel, sum); // 存储水位对应的每个位置的和

    const columnsCount = rows[0] ? rows[0].length : 0;
    for (let i = 1; i < columnsCount; i++) {
      let positionSum = 0;
      let c = 0;
      for (const row of rows) {
        const x = Number(row[i]);
        if (!Number.isFinite(x)) continue;
        const y = x - c;
        const t = positionSum + y;
        c = t - positionSum - y;
        positionSum = t;
      }
      if (!Number.isFinite(positionSum)) positionSum = Number.MAX_VALUE;
      sum.push(Number(positionSum.toFixed(6)));
    }
    result.set(waterLevel, sum); // 存储水位对应的每个位置的和
  }

  return result;
}

// const aaaa=getDataForTable(tables.get("果木村"),"199.5") // ['199.5', 355.34, 0, 1355.33, 317.51, 263.22]
// const bbbb=getSumOfFieldRows(tables,"199.5") //['0199.5', 355.34, 0, 1355.33, 317.51, 263.22]
// const cccc=getSumOfEachWaterLevel(tables) //['0199.5', 355.34, 0, 1355.33, 317.51, 263.22]

function getStatisticalData(fieldName) {
  if (!fieldName) return getSumOfEachWaterLevel(tables);
  return getDataForTable(tables, fieldName);
}

export { getDataForTable, getStatisticalData, tables };
