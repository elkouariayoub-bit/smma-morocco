const missing = (name: string) => {
  return () => {
    throw new Error(
      `pdf-lib ${name} is unavailable. Install the real package to enable PDF exports.`
    );
  };
};

export const PDFDocument = class {
  static async create() {
    throw new Error('PDF generation requires pdf-lib to be installed.');
  }

  static async load() {
    throw new Error('PDF generation requires pdf-lib to be installed.');
  }
};

export const rgb = missing('rgb');
export const StandardFonts = new Proxy(
  {},
  {
    get() {
      throw new Error('pdf-lib StandardFonts is unavailable without the real package.');
    },
  }
);

const stubModule = {
  PDFDocument,
  StandardFonts,
  rgb,
  __isStub: true,
};

export default stubModule;
