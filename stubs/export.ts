export type ExportFormat = 'csv' | 'pdf' | 'excel'

export async function simulateExport(format: ExportFormat) {
  await delay(220)
  return {
    success: true,
    message: `Simulated ${format.toUpperCase()} export ready for download.`,
  }
}

export async function simulatePreviewRefresh() {
  await delay(160)
  return {
    success: true,
  }
}

function delay(duration: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}
