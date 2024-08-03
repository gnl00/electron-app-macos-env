import { Button } from '@renderer/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@renderer/components/ui/accordion'
import { Badge } from '@renderer/components/ui/badge'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Textarea } from '@renderer/components/ui/textarea'
import { Separator } from '@renderer/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import {
  GearIcon,
  DrawingPinIcon,
  DrawingPinFilledIcon,
  QuestionMarkCircledIcon
} from '@radix-ui/react-icons'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Toggle } from '@renderer/components/ui/toggle'
import { useState } from 'react'

const Test = (): JSX.Element => {
  const [pinState, setPinState] = useState<boolean>(false)

  const onPinToggleClick = (): void => {
    setPinState(!pinState)

    // TODO pin window
    window.electron.ipcRenderer.invoke('pin-window', !pinState)
  }

  return (
    <>
      <div className="m-2">
        <div className="flex justify-between w-full space-x-2">
          <Popover>
            <PopoverTrigger>
              <div className="h-8 rounded-md px-3 border hover:bg-accent hover:text-accent-foreground flex items-center">
                <GearIcon />
              </div>
            </PopoverTrigger>
            <PopoverContent className="m-2 w-full">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Prefernces</h4>
                  <p className="text-sm text-muted-foreground">Set the prefernces for the TEApp</p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="token">
                      <span>
                        Token
                        <Button size={'round'} variant={'ghost'}>
                          <QuestionMarkCircledIcon></QuestionMarkCircledIcon>
                        </Button>
                      </span>
                    </Label>
                    <Input
                      id="token"
                      placeholder="Please input your token"
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="api">Custom API</Label>
                    <Input
                      id="api"
                      className="col-span-2 h-8 text-xs"
                      placeholder="server:port/chat/v1/x"
                    />
                  </div>
                </div>
                <Button size="xs">Save Configurations</Button>
              </div>
            </PopoverContent>
          </Popover>
          <Toggle size="xs" variant="outline" onClick={onPinToggleClick}>
            {pinState ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
          </Toggle>
        </div>
        <Separator style={{ margin: '10px 0' }} />
        <div className="flex w-full items-end space-x-2">
          <Textarea className="bg-slate-50" placeholder="translate context" />
          <Button size="sm" type="submit">
            Submit
          </Button>
        </div>
        <br></br>
        <ScrollArea className="h-96 min-h-1/3 w-full rounded-md border p-4">
          <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']}>
            <AccordionItem value="item-1" data-state="open">
              <AccordionTrigger>
                <Badge variant="outline-slate">THUDM/glm-4-9b-chat</Badge>
              </AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA
                design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to
                the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                <Badge variant="outline-slate">Qwen/Qwen2-7B-Instruct</Badge>
              </AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA
                design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to
                the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>
                <Badge variant="outline-slate">Qwen/Qwen2-1.5B-Instruct (32K)</Badge>
              </AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA
                design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to
                the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>
                <Badge variant="outline-slate">Qwen/Qwen1.5-7B-Chat (32K)</Badge>
              </AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA
                design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to
                the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>
                <Badge variant="outline-slate">01-ai/Yi-1.5-9B-Chat-32K (32K)</Badge>
              </AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA
                design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to
                the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>
                <Badge variant="outline-slate">01-ai/Yi-1.5-9B-Chat-16K (16K)</Badge>
              </AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA
                design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to
                the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </div>
    </>
  )
}

export default Test
