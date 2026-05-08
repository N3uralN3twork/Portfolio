import { describe, expect, test } from "vitest";
import populationData from "../../public/data/leaflet-japan/japan-prefecture-population-2024.json";
import {
  buildChoroplethBins,
  formatJapanMetricValue,
  getJapanMetricValue,
  getJapanPrefectureJoinSummary,
  japanLeafletMetrics,
  validateJapanPopulationRecords,
  type JapanMetricId,
} from "./leaflet-japan";

const featureIds = Array.from({ length: 47 }, (_, index) => index + 1);
const records = populationData.records;

describe("Leaflet Japan choropleth data helpers", () => {
  test("validates the curated 2024 prefecture dataset", () => {
    const validation = validateJapanPopulationRecords(records);

    expect(validation).toEqual({
      isValid: true,
      recordCount: 47,
      missingIds: [],
      duplicateIds: [],
      invalidMetricIds: [],
    });
    expect(records.find((record) => record.id === 13)).toMatchObject({
      prefecture: "Tokyo-to",
      totalPopulation: 14178000,
      annualPopulationChangePerMille: 6.6,
      olderAdultShare: 22.7,
      populationDensityPerKm2: 6403,
    });
  });

  test("confirms all GeoJSON feature ids join to population records", () => {
    const summary = getJapanPrefectureJoinSummary(featureIds, records);

    expect(summary).toEqual({
      featureCount: 47,
      recordCount: 47,
      joinedCount: 47,
      missingFeatureIds: [],
      missingRecordIds: [],
    });
  });

  test("describes the four data app metrics used by the map", () => {
    expect(japanLeafletMetrics.map((metric) => metric.id)).toEqual([
      "totalPopulation",
      "annualPopulationChangePerMille",
      "olderAdultShare",
      "populationDensityPerKm2",
    ]);
    expect(
      formatJapanMetricValue(
        getJapanMetricValue(records[12], "totalPopulation"),
        "totalPopulation",
      ),
    ).toBe("14,178,000 people");
    expect(
      formatJapanMetricValue(
        getJapanMetricValue(records[12], "annualPopulationChangePerMille"),
        "annualPopulationChangePerMille",
      ),
    ).toBe("+6.6 per 1,000");
  });

  test("builds stable choropleth bins from metric values", () => {
    const metricId: JapanMetricId = "olderAdultShare";
    const bins = buildChoroplethBins(records, metricId, 5);

    expect(bins).toHaveLength(5);
    expect(bins[0]).toMatchObject({
      min: 22.7,
      max: 26.1,
      color: "#2c7bb6",
    });
    expect(bins[4]).toMatchObject({
      min: 36.2,
      max: 39.5,
      color: "#d7191c",
    });
  });
});
