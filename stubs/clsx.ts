export type ClassValue = string | number | null | undefined | ClassDictionary | ClassValue[]
export type ClassDictionary = Record<string, unknown>

function toValue(input: ClassValue): string {
  if (!input) return ""
  if (typeof input === "string" || typeof input === "number") return String(input)
  if (Array.isArray(input)) return input.map(toValue).filter(Boolean).join(" ")
  if (typeof input === "object") {
    return Object.keys(input)
      .filter((key) => Boolean((input as ClassDictionary)[key]))
      .join(" ")
  }
  return ""
}

export function clsx(...inputs: ClassValue[]): string {
  return inputs.map(toValue).filter(Boolean).join(" ").trim()
}

export default clsx
