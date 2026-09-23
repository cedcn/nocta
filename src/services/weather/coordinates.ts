// WGS-84 → GCJ-02, ported from XMSLEEP CoordinateUtils. QWeather expects GCJ-02 inside mainland
// China, otherwise locations drift by hundreds of metres; outside China coordinates pass through.
const A = 6378245.0;
const EE = 0.00669342162296594323;

const isInChina = (lat: number, lon: number) => lon > 73.0 && lon < 135.0 && lat > 3.0 && lat < 54.0;

const transformLat = (x: number, y: number) => {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin((y / 3.0) * Math.PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((y / 12.0) * Math.PI) + 320.0 * Math.sin((y * Math.PI) / 30.0)) * 2.0) / 3.0;
  return ret;
};

const transformLon = (x: number, y: number) => {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin((x / 3.0) * Math.PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((x / 12.0) * Math.PI) + 300.0 * Math.sin((x / 30.0) * Math.PI)) * 2.0) / 3.0;
  return ret;
};

export function wgs84ToGcj02(lat: number, lon: number): { lat: number; lon: number } {
  if (!isInChina(lat, lon)) return { lat, lon };
  const dLat = transformLat(lon - 105.0, lat - 35.0);
  const dLon = transformLon(lon - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  return {
    lat: lat + (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * Math.PI),
    lon: lon + (dLon * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * Math.PI),
  };
}
