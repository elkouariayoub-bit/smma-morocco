const message =
  "exceljs is not available in this environment. Install the real dependency to enable Excel exports.";

class StubRow {
  font: unknown;
  alignment: unknown;

  eachCell(): never {
    throw new Error(message);
  }
}

class StubWorksheet {
  columns: unknown;

  addRows(): never {
    throw new Error(message);
  }

  getRow(): StubRow {
    return new StubRow();
  }
}

class StubWorkbook {
  creator?: string;
  created?: Date;

  addWorksheet(): StubWorksheet {
    return new StubWorksheet();
  }

  get xlsx() {
    return {
      writeBuffer: async (): Promise<never> => {
        throw new Error(message);
      },
    };
  }
}

export default {
  Workbook: StubWorkbook,
};
