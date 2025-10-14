class Worksheet {
  constructor(name) {
    this.name = name;
    this.columns = [];
    this._rows = [];
  }

  addRows(rows = []) {
    this._rows.push(...rows);
  }

  getRow() {
    const cell = { fill: null, border: null };
    return {
      font: {},
      eachCell: (cb) => {
        if (typeof cb === 'function') cb(cell, 0);
      },
    };
  }
}

class Workbook {
  constructor() {
    this.creator = 'exceljs-stub';
    this.created = new Date();
    this._worksheets = [];
    this.xlsx = {
      writeBuffer: async () => new Uint8Array(),
    };
  }

  addWorksheet(name) {
    const worksheet = new Worksheet(name);
    this._worksheets.push(worksheet);
    return worksheet;
  }
}

const stub = { Workbook, __isStub: true };
module.exports = stub;
module.exports.default = stub;
