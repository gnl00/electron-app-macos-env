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
import { useToast } from "@renderer/components/ui/use-toast"
import { Toaster } from "@renderer/components/ui/toaster"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@renderer/components/ui/tooltip"
import { useEffect, useState } from 'react'
import { PIN_WINDOW, GET_CONFIG, OPEN_EXTERNAL, SAVE_CONFIG } from '@constants/index'
import { IAppConfig, IBaseResponse, ITranslateRequest } from '@types.d/index'
import { translateRequestWithHook } from '@request/index'
import ReactMarkdown from 'react-markdown'
// import { useEffectOnce } from 'react-use'

const Home = (): JSX.Element => {

  const [pinState, setPinState] = useState<boolean>(false)
  const [appConfig, setAppConfig] = useState<IAppConfig>({
    api: 'https://api.siliconflow.cn/v1/chat/completions',
    token: '',
    prompt: '',
    model: 'Qwen/Qwen2-7B-Instruct'
  })
  const [translateText, setTranslateText] = useState<string>('')
  const [fetching, setFetchingState] = useState<boolean>(false)
  const [translateResult, setTranslateResult] = useState<string>()
  const [defaultOpenValue, setDefaultOpenValue] = useState<string>('item-0')

  const { toast } = useToast()

  useEffect(() => {
    // get config from main
    window.electron.ipcRenderer.invoke(GET_CONFIG).then((config: IAppConfig) => {
      // console.log('got from main: ', config)
      setAppConfig({
        ...appConfig,
        ...config
      })
    })
  }, [])

  const onPinToggleClick = (): void => {
    setPinState(!pinState)

    // pin window
    window.electron.ipcRenderer.invoke(PIN_WINDOW, !pinState)
  }

  const onConfigurationsChange = (config): void => {
    setAppConfig({
      ...appConfig,
        ...config
    })
  }

  const saveConfigurationClick = (): void => {
    window.electron.ipcRenderer.invoke(SAVE_CONFIG, appConfig)
    console.log('configurations to save: ', appConfig)
    toast({
      className: 'top-0 right-0 flex fixed md:max-w-[360px] md:top-4 md:right-4',
      variant: 'default',
      // title: 'Save Configuration',
      description: '✅ Save configurations success',
      duration: 800
      // action: <ToastAction altText="Try again">Try again</ToastAction>
    })
  }

  const onTokenQuestionClick = (): void => {
    console.log('token question click');
    
    // window.electron.ipcRenderer.openex
    // shell.openExternal('www.baidu.com')
    window.electron.ipcRenderer.invoke(OPEN_EXTERNAL, 'https://cloud.siliconflow.cn/account/ak')
  }

  const onTranslateTextChange = (evt) => {
    setTranslateText(evt.target.value)
  }

  const beforeFetch = () => {
    setFetchingState(true)
  }

  const afterFetch = () => {
    setFetchingState(false)
  }

  const onSubmitClick = async (): Promise<void> => {
    if (!translateText) {
      return
    }

    // set result empty first
    setTranslateResult('')

    console.log('translateText', translateText)
    const req: ITranslateRequest = {
      url: appConfig.api,
      text: translateText,
      token: appConfig.token,
      prompt: appConfig.prompt,
      model: appConfig.model
    }

    const result: IBaseResponse = await translateRequestWithHook(req, beforeFetch, afterFetch)
    console.log('translate result: ', result);

    const resultText = result.choices[0].message.content
    setTranslateResult(resultText)

    // just...not work
    setDefaultOpenValue('item-0')
  }

  return (
    <>
      <div className="m-2 app-dragable">
        <div className="flex justify-between w-full space-x-2">
          <Popover>
            <PopoverTrigger className="app-undragable">
              <div className="h-8 rounded-md px-3 border hover:bg-accent hover:text-accent-foreground flex items-center">
                <GearIcon />
              </div>
            </PopoverTrigger>
            <PopoverContent className="m-2 w-full app-undragable">
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
                          <TooltipProvider>
                            <Tooltip>
                              {/* asChild fix validateDOMNesting(...): <button> cannot appear as a descendant of <button>. */}
                              <TooltipTrigger asChild>
                                <QuestionMarkCircledIcon onClick={onTokenQuestionClick}></QuestionMarkCircledIcon>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to get token from <strong>siliconflow</strong></p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Button>
                      </span>
                    </Label>
                    <Input
                      id="token"
                      placeholder="Please input your token"
                      defaultValue={appConfig?.token}
                      className="col-span-2 h-8"
                      onChange={(event) =>
                        onConfigurationsChange({ ...appConfig, token: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="api">Custom API</Label>
                    <Input
                      id="api"
                      className="col-span-2 h-8 text-xs"
                      defaultValue={appConfig?.api}
                      placeholder="server:port/chat/v1/x"
                      onChange={(event) =>
                        onConfigurationsChange({ ...appConfig, api: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="prompt">Translate Prompt</Label>
                    <Textarea
                      id="prompt"
                      className="col-span-2 h-8 text-xs"
                      defaultValue={appConfig?.prompt}
                      onChange={(event) =>
                        onConfigurationsChange({ ...appConfig, prompt: event.target.value })
                      }
                    />
                  </div>
                </div>
                <Button size="xs" onClick={saveConfigurationClick}>
                  Save Configurations
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Toggle className="app-undragable" size="xs" variant="outline" onClick={onPinToggleClick}>
            {pinState ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
          </Toggle>
        </div>
        <Separator style={{ margin: '10px 0' }} />
        <div className="app-undragable flex w-full items-end space-x-2">
          <Textarea onChange={onTranslateTextChange} className="bg-slate-50" placeholder="Translate context" />
          <Button size="sm" type="submit" onClick={onSubmitClick}>
            Submit
          </Button>
        </div>
        <br></br>
        <div className='w-full'>
          {
            fetching ? 
            <>
              <div className='flex justify-center'>
                <Separator className='w-1/3' style={{ margin: '10px 0' }} />
                <span className='text-xs text-slate-500'>Translating</span>
                <Separator className='w-1/3' style={{ margin: '10px 0' }} />
              </div>
            </> : 
            <>
              <div className='flex justify-center'>
                <Separator className='w-1/3' style={{ margin: '5px 0' }} />
                <span className='text-xs text-slate-400'>&nbsp;</span>
                <Separator className='w-1/3' style={{ margin: '5px 0' }} />
              </div>
            </>
          }
        </div>
        <ScrollArea className="app-undragable h-96 w-full rounded-md border p-4">
          <Accordion type="single" defaultValue={defaultOpenValue} collapsible>
            <AccordionItem value="item-0">
              <AccordionTrigger>
                <Badge variant="outline-slate">{appConfig.model}</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <article className="prose lg:prose-xl">
                  <ReactMarkdown>
                    {translateResult}
                  </ReactMarkdown>
                </article>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
        <Toaster />
      </div>
    </>
  )
}

export default Home
