"use client";

import {
  InfoIcon,
  LayersIcon,
  LocateFixedIcon,
  MapIcon,
  MousePointerClickIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MdxDemoCard } from "@/components/mdx/wide-demo-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildChoroplethBins,
  formatJapanMetricValue,
  getChoroplethColor,
  getJapanMetricValue,
  getJapanPrefectureJoinSummary,
  japanLeafletMetrics,
  type JapanMetricId,
  type JapanPopulationRecord,
} from "@/lib/leaflet-japan";
import { cn } from "@/lib/utils";

type JapanPopulationPayload = {
  sourceYear: number;
  notes: string[];
  records: JapanPopulationRecord[];
};

type JapanGeoJsonFeature = {
  type: "Feature";
  properties: {
    id: number;
    nam: string;
    nam_ja?: string;
  };
  geometry: unknown;
};

type JapanGeoJson = {
  type: "FeatureCollection";
  features: JapanGeoJsonFeature[];
};

type LeafletBounds = unknown;

type LeafletBoundsOptions = {
  padding: [number, number];
};

type LeafletRemovable = {
  remove: () => void;
};

type LeafletMap = LeafletRemovable & {
  fitBounds: (bounds: LeafletBounds, options?: LeafletBoundsOptions) => void;
  invalidateSize: () => void;
};

type LeafletControl = LeafletRemovable & {
  addTo: (map: LeafletMap) => LeafletControl;
};

type LeafletTileLayer = LeafletRemovable;

type LeafletGridLayer = LeafletTileLayer & {
  createTile: () => HTMLElement;
};

type LeafletFeatureLayer = {
  bindTooltip: (
    content: string,
    options: { sticky: boolean; opacity: number },
  ) => void;
  bindPopup: (content: string) => void;
  on: (handlers: {
    mouseover: () => void;
    mouseout: () => void;
    click: () => void;
  }) => void;
  setStyle: (style: {
    color: string;
    weight: number;
    fillOpacity: number;
  }) => void;
  bringToFront: () => void;
  openPopup: () => void;
};

type LeafletGeoJsonLayer = LeafletRemovable & {
  addTo: (map: LeafletMap) => LeafletGeoJsonLayer;
  getBounds: () => LeafletBounds;
  resetStyle: (layer: LeafletFeatureLayer) => void;
};

type LeafletModule = typeof import("leaflet") & {
  gridLayer: (options: { attribution: string }) => LeafletGridLayer;
  tileLayer: (
    urlTemplate: string,
    options: { maxZoom: number; attribution: string },
  ) => LeafletTileLayer;
  map: (
    element: HTMLElement,
    options: {
      center: [number, number];
      zoom: number;
      zoomSnap: number;
      scrollWheelZoom: boolean;
      layers: LeafletTileLayer[];
    },
  ) => LeafletMap;
  control: {
    layers: (
      baseLayers: Record<string, LeafletTileLayer>,
      overlays: undefined,
      options: { collapsed: boolean },
    ) => LeafletControl;
    scale: (options: {
      imperial: boolean;
      position: "bottomleft";
    }) => LeafletControl;
  };
  geoJSON: (
    geoJson: JapanGeoJson,
    options: {
      style: (feature: JapanGeoJsonFeature) => {
        color: string;
        weight: number;
        opacity: number;
        fillColor: string;
        fillOpacity: number;
      };
      onEachFeature: (
        feature: JapanGeoJsonFeature,
        layer: LeafletFeatureLayer,
      ) => void;
    },
  ) => LeafletGeoJsonLayer;
};

const dataRoot = "/data/leaflet-japan";
const defaultMetric: JapanMetricId = "totalPopulation";

export function JapanLeafletChoroplethDemo() {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const geoJsonLayerRef = useRef<LeafletGeoJsonLayer | null>(null);
  const layerControlRef = useRef<LeafletControl | null>(null);
  const scaleControlRef = useRef<LeafletControl | null>(null);
  const tileLayerRefs = useRef<LeafletTileLayer[]>([]);
  const [activeMetric, setActiveMetric] =
    useState<JapanMetricId>(defaultMetric);
  const [geoJson, setGeoJson] = useState<JapanGeoJson | null>(null);
  const [population, setPopulation] =
    useState<JapanPopulationPayload | null>(null);
  const [selectedId, setSelectedId] = useState<number>(13);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const records = useMemo(() => population?.records ?? [], [population]);
  const recordById = useMemo(
    () => new Map(records.map((record) => [record.id, record])),
    [records],
  );
  const activeMetricConfig =
    japanLeafletMetrics.find((metric) => metric.id === activeMetric) ??
    japanLeafletMetrics[0];
  const bins = useMemo(
    () => (records.length ? buildChoroplethBins(records, activeMetric, 5) : []),
    [activeMetric, records],
  );
  const selectedRecord =
    recordById.get(selectedId) ?? recordById.get(13) ?? records[0];
  const joinSummary = useMemo(() => {
    if (!geoJson || !records.length) {
      return null;
    }

    return getJapanPrefectureJoinSummary(
      geoJson.features.map((feature) => Number(feature.properties.id)),
      records,
    );
  }, [geoJson, records]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setStatus("loading");

      try {
        const [geoJsonResponse, populationResponse] = await Promise.all([
          fetch(`${dataRoot}/japan-prefectures.geojson`),
          fetch(`${dataRoot}/japan-prefecture-population-2024.json`),
        ]);

        if (!geoJsonResponse.ok || !populationResponse.ok) {
          throw new Error("Unable to load local Japan map data.");
        }

        const [nextGeoJson, nextPopulation] = await Promise.all([
          geoJsonResponse.json() as Promise<JapanGeoJson>,
          populationResponse.json() as Promise<JapanPopulationPayload>,
        ]);

        if (!cancelled) {
          setGeoJson(nextGeoJson);
          setPopulation(nextPopulation);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapNodeRef.current || !geoJson || !records.length || !bins.length) {
      return;
    }

    let cancelled = false;

    async function drawMap() {
      const L: LeafletModule = await import("leaflet");

      if (cancelled || !mapNodeRef.current) {
        return;
      }

      if (!mapRef.current) {
        const localGrid = L.gridLayer({
          attribution: "Local reference grid",
        });
        localGrid.createTile = () => {
          const tile = document.createElement("div");
          tile.style.backgroundColor = "var(--muted)";
          tile.style.backgroundImage =
            "linear-gradient(90deg, rgba(100,116,139,.16) 1px, transparent 1px), linear-gradient(rgba(100,116,139,.16) 1px, transparent 1px)";
          tile.style.backgroundSize = "24px 24px";
          tile.style.border = "1px solid rgba(100,116,139,.12)";
          return tile;
        };
        const openStreetMap = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            attribution: "&copy; OpenStreetMap contributors",
          },
        );
        const cartoLight = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 18,
            attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
          },
        );

        tileLayerRefs.current = [localGrid, openStreetMap, cartoLight];
        mapRef.current = L.map(mapNodeRef.current, {
          center: [37.8, 138.5],
          zoom: 5,
          zoomSnap: 0.25,
          scrollWheelZoom: false,
          layers: [localGrid],
        });
        layerControlRef.current = L.control
          .layers(
            {
              "Local grid": localGrid,
              OpenStreetMap: openStreetMap,
              "Carto light": cartoLight,
            },
            undefined,
            { collapsed: true },
          )
          .addTo(mapRef.current);
        scaleControlRef.current = L.control
          .scale({ imperial: false, position: "bottomleft" })
          .addTo(mapRef.current);
      }

      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.remove();
      }

      const geoJsonLayer = L.geoJSON(geoJson, {
        style: (feature: JapanGeoJsonFeature) => {
          const record = recordById.get(Number(feature.properties.id));
          const value = record ? getJapanMetricValue(record, activeMetric) : 0;

          return {
            color: "#ffffff",
            weight: 1,
            opacity: 0.9,
            fillColor: getChoroplethColor(value, bins),
            fillOpacity: 0.78,
          };
        },
        onEachFeature: (
          feature: JapanGeoJsonFeature,
          layer: LeafletFeatureLayer,
        ) => {
          const record = recordById.get(Number(feature.properties.id));

          if (!record) {
            return;
          }

          layer.bindTooltip(record.prefecture, {
            sticky: true,
            opacity: 0.92,
          });
          layer.bindPopup(renderPopup(record, activeMetric));
          layer.on({
            mouseover: () => {
              setHoveredName(record.prefecture);
              layer.setStyle({
                color: "#111827",
                weight: 2,
                fillOpacity: 0.92,
              });
              layer.bringToFront();
            },
            mouseout: () => {
              setHoveredName(null);
              geoJsonLayer.resetStyle(layer);
            },
            click: () => {
              setSelectedId(record.id);
              layer.openPopup();
            },
          });
        },
      }).addTo(mapRef.current);

      geoJsonLayerRef.current = geoJsonLayer;
      mapRef.current?.fitBounds(geoJsonLayer.getBounds(), {
        padding: [18, 18],
      });
      window.setTimeout(() => mapRef.current?.invalidateSize(), 0);
    }

    drawMap();

    return () => {
      cancelled = true;
    };
  }, [activeMetric, bins, geoJson, recordById, records.length]);

  useEffect(() => {
    return () => {
      geoJsonLayerRef.current?.remove();
      layerControlRef.current?.remove();
      scaleControlRef.current?.remove();
      tileLayerRefs.current.forEach((layer) => layer.remove?.());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <MdxDemoCard className="gap-0">
      <CardHeader className="gap-5 border-b">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <MapIcon className="size-3.5" aria-hidden />
              Leaflet.js choropleth
            </Badge>
            <CardTitle className="max-w-3xl text-2xl tracking-normal">
              Japan prefectures, styled by current population metrics.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Switch the metric to see how population size, yearly change,
              aging, and density tell different geographic stories.
            </CardDescription>
          </div>
          <div className="rounded-lg border bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Join check
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {joinSummary ? `${joinSummary.joinedCount}/47` : "Loading"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {japanLeafletMetrics.map((metric) => (
            <Button
              key={metric.id}
              type="button"
              variant={activeMetric === metric.id ? "default" : "outline"}
              size="sm"
              aria-pressed={activeMetric === metric.id}
              onClick={() => setActiveMetric(metric.id)}
            >
              {metric.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid gap-0 p-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="relative min-h-[28rem] border-b bg-muted lg:border-b-0 lg:border-r">
          <div ref={mapNodeRef} className="h-[28rem] w-full lg:h-[36rem]" />
          {status !== "ready" ? (
            <div className="absolute inset-0 grid place-items-center bg-background/80 px-6 text-center backdrop-blur-sm">
              <div>
                <p className="text-base font-medium">
                  {status === "error"
                    ? "The local map data could not load."
                    : "Loading Japan map data..."}
                </p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  The GeoJSON and e-Stat metrics are served from this site so
                  the demo does not depend on GitHub at runtime.
                </p>
              </div>
            </div>
          ) : null}
          {hoveredName ? (
            <div className="absolute left-3 top-3 rounded-lg border bg-background/95 px-3 py-2 text-sm shadow-sm">
              {hoveredName}
            </div>
          ) : null}
        </div>
        <aside className="flex flex-col gap-5 p-4">
          <section className="rounded-lg border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <LayersIcon className="size-4 text-muted-foreground" />
              {activeMetricConfig.legendLabel}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {activeMetricConfig.description}
            </p>
            <div className="mt-4 space-y-2">
              {bins.map((bin) => (
                <div
                  key={`${bin.min}-${bin.max}`}
                  className="grid grid-cols-[1rem_1fr] items-center gap-2 text-xs"
                >
                  <span
                    className="h-3 rounded-sm"
                    style={{ backgroundColor: bin.color }}
                  />
                  <span>
                    {formatJapanMetricValue(bin.min, activeMetric)} to{" "}
                    {formatJapanMetricValue(bin.max, activeMetric)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MousePointerClickIcon className="size-4 text-muted-foreground" />
              Selected prefecture
            </div>
            {selectedRecord ? (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xl font-semibold">
                    {selectedRecord.prefecture}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatJapanMetricValue(
                      getJapanMetricValue(selectedRecord, activeMetric),
                      activeMetric,
                    )}
                  </p>
                </div>
                <MetricRow
                  label="Population"
                  value={formatJapanMetricValue(
                    selectedRecord.totalPopulation,
                    "totalPopulation",
                  )}
                />
                <MetricRow
                  label="Annual change"
                  value={formatJapanMetricValue(
                    selectedRecord.annualPopulationChangePerMille,
                    "annualPopulationChangePerMille",
                  )}
                />
                <MetricRow
                  label="Age 65+"
                  value={formatJapanMetricValue(
                    selectedRecord.olderAdultShare,
                    "olderAdultShare",
                  )}
                />
                <MetricRow
                  label="Density"
                  value={formatJapanMetricValue(
                    selectedRecord.populationDensityPerKm2,
                    "populationDensityPerKm2",
                  )}
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <InfoIcon className="size-4 text-muted-foreground" />
              Data notes
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>Population values are 2024 estimates.</li>
              <li>Change rates are per mille, not percent.</li>
              <li>Map boundaries come from the original Japan GeoJSON file.</li>
            </ul>
          </section>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("w-full justify-center", status !== "ready" && "hidden")}
            onClick={() => {
              if (geoJsonLayerRef.current) {
                mapRef.current?.fitBounds(geoJsonLayerRef.current.getBounds(), {
                  padding: [18, 18],
                });
              }
            }}
          >
            <LocateFixedIcon className="size-4" aria-hidden />
            Reset extent
          </Button>
        </aside>
      </CardContent>
    </MdxDemoCard>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t pt-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function renderPopup(record: JapanPopulationRecord, metricId: JapanMetricId) {
  return `
    <strong>${record.prefecture}</strong><br/>
    ${formatJapanMetricValue(getJapanMetricValue(record, metricId), metricId)}<br/>
    Population: ${formatJapanMetricValue(record.totalPopulation, "totalPopulation")}<br/>
    Age 65+: ${formatJapanMetricValue(record.olderAdultShare, "olderAdultShare")}
  `;
}
