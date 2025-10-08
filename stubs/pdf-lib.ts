export class PDFDocumentStub {
  static async create() {
    throw new Error('pdf-lib is stubbed in this environment. Install pdf-lib in a real runtime to use this API.');
  }

  static async load() {
    throw new Error('pdf-lib is stubbed in this environment. Install pdf-lib in a real runtime to use this API.');
  }

  addPage() {
    throw new Error('pdf-lib is stubbed in this environment. Install pdf-lib in a real runtime to use this API.');
  }

  save() {
    throw new Error('pdf-lib is stubbed in this environment. Install pdf-lib in a real runtime to use this API.');
  }
}

export const PDFDocument = PDFDocumentStub;
export const rgb = () => {
  throw new Error('pdf-lib rgb helper is unavailable in this stub.');
};
export const StandardFonts = new Proxy(
  {},
  {
    get() {
      throw new Error('pdf-lib StandardFonts is unavailable in this stub.');
    },
  }
);

export default {
  PDFDocument,
  rgb,
  StandardFonts,
};
