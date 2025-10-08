import { createRequire } from 'module';

type PdfLibModule = {
  PDFDocument: any;
  StandardFonts: any;
  rgb: (...args: any[]) => any;
};

const moduleName = 'pdf-lib';
let actual: PdfLibModule | undefined;
let loadError: Error | undefined;

try {
  const require = createRequire(import.meta.url);
  actual = require(moduleName) as PdfLibModule;
} catch (err) {
  loadError = err instanceof Error ? err : new Error(String(err));
}

const missing = (name: string) => {
  return () => {
    throw new Error(
      `pdf-lib ${name} is unavailable. Install the real package to enable PDF exports.`
    );
  };
};

export const PDFDocument = actual?.PDFDocument ?? class {
  static async create() {
    throw new Error('PDF generation requires pdf-lib to be installed.');
  }

  static async load() {
    throw new Error('PDF generation requires pdf-lib to be installed.');
  }
};

export const rgb = actual?.rgb ?? missing('rgb');
export const StandardFonts = actual?.StandardFonts ?? new Proxy(
  {},
  {
    get() {
      throw new Error('pdf-lib StandardFonts is unavailable without the real package.');
    },
  }
);

export const __pdfLibLoadError = loadError;

const fallback: PdfLibModule = {
  PDFDocument,
  StandardFonts,
  rgb,
};

export default (actual ?? fallback) as PdfLibModule;
