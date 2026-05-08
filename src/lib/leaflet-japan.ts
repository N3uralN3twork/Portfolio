export type JapanPopulationRecord = {
  id: number;
  prefecture: string;
  totalPopulation: number;
  malePopulation: number;
  femalePopulation: number;
  sexRatio: number;
  annualPopulationChangePerMille: number;
  under15Share: number;
  workingAgeShare: number;
  olderAdultShare: number;
  areaKm2: number;
  populationDensityPerKm2: number;
};

export type JapanMetricId =
  | "totalPopulation"
  | "annualPopulationChangePerMille"
  | "olderAdultShare"
  | "populationDensityPerKm2";

export type JapanLeafletMetric = {
  id: JapanMetricId;
  label: string;
  legendLabel: string;
  description: string;
};

export type JapanChoroplethBin = {
  min: number;
  max: number;
  color: string;
};

const expectedPrefectureIds = Array.from({ length: 47 }, (_, index) => index + 1);

const choroplethColors = [
  "#2c7bb6",
  "#abd9e9",
  "#ffffbf",
  "#fdae61",
  "#d7191c",
] as const;

export const japanLeafletMetrics: JapanLeafletMetric[] = [
  {
    id: "totalPopulation",
    label: "Population",
    legendLabel: "2024 population",
    description: "Estimated residents as of October 1, 2024.",
  },
  {
    id: "annualPopulationChangePerMille",
    label: "Change rate",
    legendLabel: "2023-2024 change",
    description: "Annual population change per 1,000 residents.",
  },
  {
    id: "olderAdultShare",
    label: "65+ share",
    legendLabel: "Age 65+ share",
    description: "Share of total population aged 65 or older.",
  },
  {
    id: "populationDensityPerKm2",
    label: "Density",
    legendLabel: "Population density",
    description: "Residents per square kilometer of total area.",
  },
];

export function validateJapanPopulationRecords(
  records: JapanPopulationRecord[],
) {
  const idCounts = new Map<number, number>();
  const invalidMetricIds: number[] = [];

  for (const record of records) {
    idCounts.set(record.id, (idCounts.get(record.id) ?? 0) + 1);

    if (
      !Number.isFinite(record.totalPopulation) ||
      !Number.isFinite(record.annualPopulationChangePerMille) ||
      !Number.isFinite(record.olderAdultShare) ||
      !Number.isFinite(record.populationDensityPerKm2)
    ) {
      invalidMetricIds.push(record.id);
    }
  }

  const missingIds = expectedPrefectureIds.filter((id) => !idCounts.has(id));
  const duplicateIds = Array.from(idCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => id);

  return {
    isValid:
      records.length === 47 &&
      missingIds.length === 0 &&
      duplicateIds.length === 0 &&
      invalidMetricIds.length === 0,
    recordCount: records.length,
    missingIds,
    duplicateIds,
    invalidMetricIds,
  };
}

export function getJapanPrefectureJoinSummary(
  featureIds: number[],
  records: JapanPopulationRecord[],
) {
  const featureIdSet = new Set(featureIds);
  const recordIdSet = new Set(records.map((record) => record.id));
  const joinedCount = featureIds.filter((id) => recordIdSet.has(id)).length;

  return {
    featureCount: featureIds.length,
    recordCount: records.length,
    joinedCount,
    missingFeatureIds: featureIds.filter((id) => !recordIdSet.has(id)),
    missingRecordIds: records
      .map((record) => record.id)
      .filter((id) => !featureIdSet.has(id)),
  };
}

export function getJapanMetricValue(
  record: JapanPopulationRecord,
  metricId: JapanMetricId,
): number {
  return record[metricId];
}

export function formatJapanMetricValue(
  value: number,
  metricId: JapanMetricId,
): string {
  if (metricId === "totalPopulation") {
    return `${new Intl.NumberFormat("en-US").format(value)} people`;
  }

  if (metricId === "annualPopulationChangePerMille") {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)} per 1,000`;
  }

  if (metricId === "olderAdultShare") {
    return `${value.toFixed(1)}%`;
  }

  return `${new Intl.NumberFormat("en-US").format(value)} people/km2`;
}

export function buildChoroplethBins(
  records: JapanPopulationRecord[],
  metricId: JapanMetricId,
  binCount = 5,
): JapanChoroplethBin[] {
  const values = records.map((record) => getJapanMetricValue(record, metricId));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / binCount;

  return Array.from({ length: binCount }, (_, index) => {
    const rawMin = index === 0 ? min : min + step * index + 0.1;
    const rawMax = index === binCount - 1 ? max : min + step * (index + 1);

    return {
      min: roundToTenth(rawMin),
      max: roundToTenth(rawMax),
      color: choroplethColors[index % choroplethColors.length],
    };
  });
}

export function getChoroplethColor(
  value: number,
  bins: JapanChoroplethBin[],
): string {
  const bin = bins.find((item) => value >= item.min && value <= item.max);

  return bin?.color ?? bins.at(-1)?.color ?? choroplethColors[0];
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}
