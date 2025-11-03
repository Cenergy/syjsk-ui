
// 将角度转换为弧度
export function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * 计算两个经纬度之间的距离
 * @param {Array<Number>} point1 第一个点的经纬度
 * @param {Array<Number>} point2 第二个点的经纬度
 * @returns {number} 两个经纬度之间的距离，单位为千米
 */
export function getDistance(point1, point2) {
    const [lat1, lon1] = point1;
    const [lat2, lon2] = point2;
    // 使用Haversine公式计算距离
    const R = 6371; // 地球半径，单位为千米
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // 距离，单位为千米

    return distance;
}
