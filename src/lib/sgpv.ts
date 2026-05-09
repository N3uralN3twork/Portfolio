export type Interval = {
  lo: number;
  hi: number;
};

export type SgpvResult = {
  overlap: number;
  denominator: number;
  pDelta: number;
  deltaGap: number | null;
};

export type SgpvClassification =
  | "delta-gap"
  | "inconclusive"
  | "null-supported";

const ninetyFivePercentZ = 1.96;

export function computeSgpv({
  estimate,
  nullInterval,
}: {
  estimate: Interval;
  nullInterval: Interval;
}): SgpvResult {
  assertFiniteInterval(estimate, "estimate");
  assertFiniteInterval(nullInterval, "nullInterval");

  const estimateLength = estimate.hi - estimate.lo;
  const nullLength = nullInterval.hi - nullInterval.lo;
  const overlap = Math.max(
    Math.min(estimate.hi, nullInterval.hi) -
      Math.max(estimate.lo, nullInterval.lo),
    0,
  );
  const denominator = Math.min(2 * nullLength, estimateLength);
  const pDelta = denominator === 0 ? 0 : clamp(overlap / denominator, 0, 1);
  const deltaGap =
    pDelta === 0
      ? (Math.max(estimate.lo, nullInterval.lo) -
          Math.min(nullInterval.hi, estimate.hi)) /
        (nullLength / 2)
      : null;

  return {
    overlap,
    denominator,
    pDelta,
    deltaGap,
  };
}

export function classifySgpv(pDelta: number): SgpvClassification {
  if (pDelta === 0) {
    return "delta-gap";
  }

  if (pDelta === 1) {
    return "null-supported";
  }

  return "inconclusive";
}

export function normalTheoryComparison({
  estimate,
  pointNull = 0,
}: {
  estimate: Interval;
  pointNull?: number;
}) {
  assertFiniteInterval(estimate, "estimate");

  const center = (estimate.lo + estimate.hi) / 2;
  const standardError = (estimate.hi - estimate.lo) / (2 * ninetyFivePercentZ);
  const z = standardError === 0 ? 0 : (center - pointNull) / standardError;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));

  return {
    center,
    standardError,
    z,
    pValue: clamp(pValue, 0, 1),
  };
}

export function formatCompactNumber(value: number, digits = 3): string {
  if (Math.abs(value) < 0.001 && value !== 0) {
    return value.toExponential(1);
  }

  return value.toFixed(digits).replace(/\.?0+$/, "");
}

function assertFiniteInterval(interval: Interval, label: string) {
  if (
    !Number.isFinite(interval.lo) ||
    !Number.isFinite(interval.hi) ||
    interval.lo > interval.hi
  ) {
    throw new Error(`${label} must have finite ordered bounds`);
  }
}

function normalCdf(value: number): number {
  return 0.5 * (1 + erf(value / Math.SQRT2));
}

function erf(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-x * x));

  return sign * y;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
