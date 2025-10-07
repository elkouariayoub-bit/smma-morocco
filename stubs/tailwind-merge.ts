export function twMerge(...inputs: Array<string | undefined | null | false>): string {
  return inputs.filter(Boolean).join(" ").trim()
}

export default twMerge
