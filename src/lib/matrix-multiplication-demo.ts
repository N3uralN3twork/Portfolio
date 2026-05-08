export const matrixA = [
  [2, -1, 3],
  [0, 4, -2],
] as const;

export const matrixB = [
  [1, 5],
  [4, -3],
  [-2, 6],
] as const;

export const matrixBTransposed = [
  [1, 4, -2],
  [5, -3, 6],
] as const;

export const matrixMethods = [
  {
    id: "ijk",
    label: "ijk naive",
    shortLabel: "Naive",
    aAccess: "contiguous row walk",
    bAccess: "strided column walk",
    cAccess: "single output write",
    cacheStory:
      "Simple and clear, but each B read jumps by the row width as k changes.",
    note: "Best first implementation for correctness and small matrices.",
  },
  {
    id: "transposed",
    label: "transpose B",
    shortLabel: "B^T",
    aAccess: "contiguous row walk",
    bAccess: "contiguous row walk",
    cAccess: "single output write",
    cacheStory:
      "Pay one setup pass so the inner loop streams through both inputs.",
    note: "Useful when B is reused or the multiply is large enough to repay setup.",
  },
  {
    id: "blocked",
    label: "blocked tiles",
    shortLabel: "Tiles",
    aAccess: "tile-local row walk",
    bAccess: "tile-local column or transposed row",
    cAccess: "partial sums per tile",
    cacheStory:
      "Work on a tile before moving on, keeping the active neighborhood hot.",
    note: "Useful when full matrices are too large for comfortable cache reuse.",
  },
] as const;

export type MatrixMethod = (typeof matrixMethods)[number];
export type MatrixMethodId = MatrixMethod["id"];

export type MatrixMultiplicationStep = {
  id: string;
  rowIndex: number;
  colIndex: number;
  row: readonly number[];
  column: readonly number[];
  products: {
    index: number;
    a: number;
    b: number;
    product: number;
    runningTotal: number;
  }[];
  sum: number;
};

export function buildMatrixMultiplicationSteps(): MatrixMultiplicationStep[] {
  return matrixA.flatMap((row, rowIndex) =>
    matrixB[0].map((_, colIndex) => {
      const column = matrixB.map((bRow) => bRow[colIndex]);
      let runningTotal = 0;
      const products = row.map((a, index) => {
        const b = column[index];
        const product = a * b;
        runningTotal += product;

        return {
          index,
          a,
          b,
          product,
          runningTotal,
        };
      });

      return {
        id: `c-${rowIndex}-${colIndex}`,
        rowIndex,
        colIndex,
        row,
        column,
        products,
        sum: runningTotal,
      };
    }),
  );
}
