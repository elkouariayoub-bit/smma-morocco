const stub = (name: string) => () => {
  throw new Error(`xlsx ${name} is stubbed in this environment. Install xlsx in a real runtime to use this API.`);
};

export const read = stub('read');
export const write = stub('write');
export const writeFile = stub('writeFile');
export const writeFileXLSX = stub('writeFileXLSX');
export const utils = {
  book_new: stub('utils.book_new'),
  json_to_sheet: stub('utils.json_to_sheet'),
  sheet_add_json: stub('utils.sheet_add_json'),
};

export default {
  read,
  write,
  writeFile,
  writeFileXLSX,
  utils,
};
