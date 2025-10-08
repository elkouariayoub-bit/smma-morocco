import { createRequire } from 'module'

type XlsxApi = {
  read: (...args: any[]) => any
  write: (...args: any[]) => any
  writeFile: (...args: any[]) => any
  writeFileXLSX: (...args: any[]) => any
  utils: {
    book_new: (...args: any[]) => any
    json_to_sheet: (...args: any[]) => any
    sheet_add_json: (...args: any[]) => any
    book_append_sheet: (...args: any[]) => any
  }
}

const moduleName = 'xlsx'
let actual: XlsxApi | undefined
let loadError: Error | undefined

try {
  const require = createRequire(import.meta.url)
  actual = require(moduleName) as XlsxApi
} catch (err) {
  loadError = err instanceof Error ? err : new Error(String(err))
}

const stub = (name: string) => {
  return (..._args: any[]) => {
    throw new Error(
      `xlsx ${name} is unavailable. Install the real package to enable spreadsheet exports.`
    )
  }
}

export const read = actual?.read ?? stub('read')
export const write = actual?.write ?? stub('write')
export const writeFile = actual?.writeFile ?? stub('writeFile')
export const writeFileXLSX = actual?.writeFileXLSX ?? stub('writeFileXLSX')
export const utils = actual?.utils ?? {
  book_new: stub('utils.book_new'),
  json_to_sheet: stub('utils.json_to_sheet'),
  sheet_add_json: stub('utils.sheet_add_json'),
  book_append_sheet: stub('utils.book_append_sheet'),
}

export const __xlsxLoadError = loadError

const fallback: XlsxApi = {
  read,
  write,
  writeFile,
  writeFileXLSX,
  utils,
}

export default (actual ?? fallback) as XlsxApi
