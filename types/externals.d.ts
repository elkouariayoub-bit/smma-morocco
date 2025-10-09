import type * as React from 'react';

declare module 'xlsx' {
  const xlsx: any;
  export default xlsx;
}

declare module 'pdf-lib' {
  const pdfLib: any;
  export default pdfLib;
}

declare module 'exceljs' {
  const exceljs: any;
  export default exceljs;
}
declare module 'react-day-picker' {
  export type DateRange = {
    from?: Date
    to?: Date
  };

  export type DayPickerProps = {
    mode?: 'single' | 'range'
    selected?: Date | DateRange
    onSelect?: (value: Date | DateRange | undefined) => void
    className?: string
    classNames?: Record<string, string>
    modifiers?: Record<string, unknown>
    numberOfMonths?: number
    captionLayout?: 'buttons' | 'dropdown'
    showOutsideDays?: boolean
    initialFocus?: boolean
    fromYear?: number
    toYear?: number
    components?: Record<string, React.ComponentType<any>>
  } & React.HTMLAttributes<HTMLDivElement>;

  export function DayPicker(props: DayPickerProps): JSX.Element;
}
