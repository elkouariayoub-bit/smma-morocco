// minimal class-variance-authority-like helper
export type CVAOptions = { 
  variants?: Record<string, Record<string, string>>; 
  defaultVariants?: Record<string, string> 
};

export function cva(base: string, opts: CVAOptions = {}) {
  return (input?: Record<string, string | undefined>) => {
    const classes = [base];
    const { variants = {}, defaultVariants = {} } = opts;
    const v = { ...defaultVariants, ...input } as Record<string, string>;
    for (const k of Object.keys(variants)) {
      const choice = v[k];
      if (choice && variants[k][choice]) classes.push(variants[k][choice]);
    }
    return classes.join(' ');
  };
}
