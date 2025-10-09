const stub = (name) => {
  return () => {
    throw new Error(
      `xlsx ${name} is unavailable. Install the real package to enable spreadsheet exports.`
    );
  };
};

export const utils = {
  book_new: stub('utils.book_new'),
  json_to_sheet: stub('utils.json_to_sheet'),
  sheet_add_json: stub('utils.sheet_add_json'),
  book_append_sheet: stub('utils.book_append_sheet'),
};

export const write = stub('write');
export const writeFile = stub('writeFile');
export const writeFileXLSX = stub('writeFileXLSX');

const fallback = {
  utils,
  write,
  writeFile,
  writeFileXLSX,
};

export default fallback;
