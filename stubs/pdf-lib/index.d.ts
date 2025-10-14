export declare class PDFPage {
  drawText(text: string, options?: Record<string, unknown>): void;
}

export declare class PDFFont {}

export declare class PDFDocument {
  static create(): Promise<PDFDocument>;
  addPage(size?: [number, number]): PDFPage;
  embedFont(name: string): Promise<PDFFont>;
  save(): Promise<Uint8Array>;
}

export declare const StandardFonts: {
  Helvetica: string;
  HelveticaBold: string;
};

export declare const __isStub: boolean;

declare const stub: {
  PDFDocument: typeof PDFDocument;
  StandardFonts: typeof StandardFonts;
  __isStub: boolean;
};
export default stub;
