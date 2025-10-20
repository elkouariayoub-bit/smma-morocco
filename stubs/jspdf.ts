export class jsPDF {
  setFontSize(_size: number) {}

  text(_text: string, _x: number, _y: number) {}

  output(type?: string): Blob {
    if (type === "blob") {
      return new Blob([], { type: "application/pdf" })
    }
    return new Blob([], { type: "application/octet-stream" })
  }
}
