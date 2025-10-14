const stub = new Proxy(
  {},
  {
    get(_target, prop) {
      throw new Error(
        `xlsx ${String(prop)} is unavailable. Install the real package to enable spreadsheet exports.`
      );
    },
  }
);

module.exports = stub;
module.exports.default = stub;
