export declare class Worksheet {
  name: string;
  columns: Array<{ header: string; key: string; width?: number }>;
  addRows(rows: any[]): void;
  getRow(index: number): { font: Record<string, unknown>; eachCell(cb: (cell: any, index: number) => void): void };
}

export declare class Workbook {
  creator: string;
  created: Date;
  xlsx: { writeBuffer(): Promise<Uint8Array> };
  addWorksheet(name: string, options?: Record<string, unknown>): Worksheet;
}

export declare const __isStub: boolean;

declare const stub: { Workbook: typeof Workbook; __isStub: boolean };
export default stub;
