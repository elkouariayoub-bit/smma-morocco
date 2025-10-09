"use client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
export default function PopoverTest(){
  return (
    <Popover>
      <PopoverTrigger asChild><Button variant="outline">Test Popover</Button></PopoverTrigger>
      <PopoverContent>Hi 👋 I am visible</PopoverContent>
    </Popover>
  )
}
