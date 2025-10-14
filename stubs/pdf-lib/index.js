class StubPage {
  drawText() {}
}

class StubFont {}

class StubPDFDocument {
  static async create() {
    return new StubPDFDocument();
  }

  addPage() {
    return new StubPage();
  }

  async embedFont() {
    return new StubFont();
  }

  async save() {
    return new Uint8Array();
  }
}

const StandardFonts = {
  Helvetica: 'Helvetica',
  HelveticaBold: 'Helvetica-Bold',
};

const stub = { PDFDocument: StubPDFDocument, StandardFonts, __isStub: true };
module.exports = stub;
module.exports.default = stub;
