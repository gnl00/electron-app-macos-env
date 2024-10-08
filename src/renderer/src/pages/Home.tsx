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
  QuestionMarkCircledIcon,
  SpaceEvenlyHorizontallyIcon
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@renderer/components/ui/dialog"
import { Switch } from "@renderer/components/ui/switch"
import { useEffect, useRef, useState } from 'react'
import { PIN_WINDOW, GET_CONFIG, OPEN_EXTERNAL, SAVE_CONFIG } from '@constants/index'
import { translateRequestWithHook } from '@request/index'
import ReactMarkdown from 'react-markdown'
import { languagesChoise } from '@config/index'
// import { useEffectOnce } from 'react-use'

const Home = (): JSX.Element => {

  // @ts-ignore
  const appVersion = __APP_VERSION__

  const customPromptTextAreaRef = useRef<HTMLTextAreaElement>(null)

  const [pinState, setPinState] = useState<boolean>(false)
  const [appConfig, setAppConfig] = useState<IAppConfig>({
    api: 'https://api.siliconflow.cn/v1/chat/completions',
    token: '',
    prompt: {
      embedded: ''
    },
    model: 'Qwen/Qwen2-7B-Instruct'
  })
  const [translateText, setTranslateText] = useState('')
  const [markdownResultKey, setMarkdownResultKey] = useState(new Date().getTime())
  const [translateResult, setTranslateResult] = useState('')
  const [fetching, setFetchingState] = useState<boolean>(false)
  const [defaultOpenValue, setDefaultOpenValue] = useState('item-0')
  const [sourceLanguage, setSourceLanguage] = useState('英文')
  const [targetLanguage, setTargetLanguage] = useState('中文')
  const [useCustomePrompt, setUseCustomePrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const markdownResultRef = useRef<HTMLDivElement>(null)
  const scrollAreaEndRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()

  useEffect(() => {
    // get config from main
    console.log('loading config')
    window.electron.ipcRenderer.invoke(GET_CONFIG).then((config: IAppConfig) => {
      // console.log('got from main: ', config)
      setAppConfig({
        ...appConfig,
        ...config
      })
      setUseCustomePrompt(config?.prompt?.useCustomePrompt || false)
      setCustomPrompt(config?.prompt?.custom || '')
    })

    // window.electron.ipcRenderer.on(CLIPBOARD_CONTENT, (_, content) => {
    //   console.log('got clipboard content', content);
    //   setTranslateText(content)
    // })

    window.api.getClipboardContent((content: string) => {
      console.log('got clipboard content', content)
      setTranslateText(content)
    })

  }, [])

  useEffect(() => {
    // auto scroll to the end
    scrollAreaEndRef.current?.scrollIntoView({behavior: 'auto'})
    //update markdown result key
    setMarkdownResultKey(new Date().getTime())
  }, [translateResult])

  const onPinToggleClick = (): void => {
    setPinState(!pinState)

    // pin window
    window.electron.ipcRenderer.invoke(PIN_WINDOW, !pinState)
  }

  const onConfigurationsChange = (config: IAppConfig): void => {
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

  const onTokenQuestionClick = (url: string): void => {
    console.log('token question click');
    
    // window.electron.ipcRenderer.openex
    // shell.openExternal('www.baidu.com')
    window.electron.ipcRenderer.invoke(OPEN_EXTERNAL, url)
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
    if (translateResult) {
      setTranslateResult('')
      setMarkdownResultKey(new Date().getTime())
      if (markdownResultRef && markdownResultRef.current != null) {
        markdownResultRef.current.innerHTML = ''
      }
    }

    // as fallback, in case of switch to use custom prompt but no input
    let rawPrompt: string = appConfig!.prompt!.embedded!
    if (useCustomePrompt && customPrompt) {
      rawPrompt = customPrompt
    }
    const prompt = rawPrompt.replace(/{{sourceLang}}/g, sourceLanguage).replace(/{{targetLang}}/g, targetLanguage)
    
    const req: ITranslateRequest = {
      url: appConfig.api!,
      text: translateText,
      token: appConfig.token!,
      prompt: prompt,
      model: appConfig.model!,
      sourceLang: sourceLanguage,
      targetLang: targetLanguage
    }

    const reader = await translateRequestWithHook(req, beforeFetch, afterFetch)

    if (!reader) {
      return
    }

    let preResult = ''
    while (true) {
      const { done, value} = await reader.read()
  
      if (done) {
        break
      }
  
      let eventDone = false
      const arr = value.split('\n')
      arr.forEach((data: any) => {
        if (data.length === 0) return; // ignore empty message
        if (data.startsWith(':')) return // ignore sse comment message
        if (data === 'data: [DONE]') {
          eventDone = true
          return
        }
        const json = JSON.parse(data.substring(('data:'.length + 1))) // stream response with a "data:" prefix
        const resultText = json.choices[0].delta.content
        // console.log(preResult += resultText || '')
        setTranslateResult(preResult += resultText || '')
      })
  
      if (eventDone) {
        break
      }
    }

    // just...not work
    setDefaultOpenValue('item-0')
  }

  const onSourceLangSelected = (lang: string) => {
    setSourceLanguage(lang)
  }

  const onTargetLangSelected = (lang: string) => {
    setTargetLanguage(lang)
  }

  const onPropmtSwicterChange = (value: boolean) => {
    setUseCustomePrompt(value)
    onConfigurationsChange({...appConfig, prompt: {...appConfig.prompt, useCustomePrompt: value}})
  }

  const onCustomPromptSave = () => {
    if (customPromptTextAreaRef && customPromptTextAreaRef.current != null) {
      const value = customPromptTextAreaRef.current.value
      setCustomPrompt(value)
      onConfigurationsChange({ ...appConfig, prompt: {...appConfig.prompt, custom: value}})
    }
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
            <PopoverContent className="m-2 min-w-96 app-undragable">
              <div className="grid gap-4">
                <div className="space-y-2 select-none">
                  <h4 className="font-medium leading-none space-x-2"><span>TEApp</span><Badge variant="secondary" className='bg-slate-100'>{appVersion}</Badge></h4>
                  <p className="text-sm text-muted-foreground">Set the prefernces for the TEApp</p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="api">API</Label>
                    <Input
                      id="api"
                      className="col-span-3 h-8 text-sm"
                      defaultValue={appConfig?.api}
                      placeholder="server:port/chat/v1/x"
                      onChange={(event) =>
                        onConfigurationsChange({ ...appConfig, api: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="model">
                      <span>
                        Model
                        <Button size={'round'} variant={'ghost'}>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              {/* asChild fix validateDOMNesting(...): <button> cannot appear as a descendant of <button>. */}
                              <TooltipTrigger asChild>
                                <QuestionMarkCircledIcon></QuestionMarkCircledIcon>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Get <strong className='underline' onClick={(_) => onTokenQuestionClick('https://docs.siliconflow.cn/docs/model-names')}>SiliconFlow-Models</strong></p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Button>
                      </span>
                    </Label>
                    <Input
                      id="model"
                      className="col-span-3 h-8 text-sm"
                      defaultValue={appConfig?.model}
                      onChange={(event) =>
                        onConfigurationsChange({ ...appConfig, model: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="token">
                      <span>
                        Token
                        <Button size={'round'} variant={'ghost'}>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              {/* asChild fix validateDOMNesting(...): <button> cannot appear as a descendant of <button>. */}
                              <TooltipTrigger asChild>
                                <QuestionMarkCircledIcon></QuestionMarkCircledIcon>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Get <strong className='underline' onClick={(_) => onTokenQuestionClick('https://cloud.siliconflow.cn/account/ak')}>SiliconFlow-Token</strong></p>
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
                      className="col-span-3 h-8 text-sm"
                      onChange={(event) =>
                        onConfigurationsChange({ ...appConfig, token: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className='col-span-4 flex items-center space-x-3'>
                      <Label htmlFor="promptModeSwitcher"><span>Custom Prompt</span></Label>
                      <Switch id='promptModeSwitcher' defaultChecked={useCustomePrompt} onCheckedChange={onPropmtSwicterChange} />
                      {
                        !useCustomePrompt ? <></> :
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant='outline' size='sm' className='w-24'>Edit Prompt</Button>
                          </DialogTrigger>
                          <DialogContent className='rounded-md w-max'>
                            <DialogHeader className='space-y-2'>
                              <DialogTitle className='select-none'>Custom prompt</DialogTitle>
                              <DialogDescription aria-describedby={undefined} />
                              <div className='space-y-3'>
                                <Textarea
                                  id="promptTextArea"
                                  ref={customPromptTextAreaRef}
                                  className="h-96 w-96 text-base text-slate-600"
                                  defaultValue={appConfig.prompt?.custom}
                                  placeholder='Input your custom prompt here...
                                    &#10;We offer 2 variables&#10;- {{sourceLang}}&#10;- {{targetLang}}&#10;as placeholders.
                                    &#10;Example&#10;请以简洁，幽默的语气将{{sourceLang}}准确的翻译成{{targetLang}}并按照...格式输出。'
                                />
                                <DialogFooter className="justify-start">
                                  <p className='text-xs text-slate-500 select-none pt-2'>Remember to save the prompt</p>
                                  <DialogClose asChild>
                                    <Button onClick={onCustomPromptSave} size='sm'>
                                      Save prompt
                                    </Button>
                                  </DialogClose>
                                </DialogFooter>
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      }
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <p className='text-xs text-slate-500 col-span-4 select-none'>Everytime you change the configurations, you need to save it.</p>
                  </div>
                </div>
                <Button size="xs" onClick={saveConfigurationClick}>
                  Save Configurations
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <div className='app-undragable flex space-x-2'>
          <Select onValueChange={onSourceLangSelected} defaultValue={sourceLanguage}>
            <SelectTrigger className="w-auto h-auto">
              <SelectValue placeholder="sourceLang" />
            </SelectTrigger>
            <SelectContent>
              {
                languagesChoise.map((item, index) => {
                  return (
                    <SelectItem key={index} value={item.value}>{item.value}</SelectItem>
                  )
                })
              }
            </SelectContent>
          </Select>
          <Button className='h-auto w-auto' variant='secondary' size='sm'><SpaceEvenlyHorizontallyIcon /></Button>
          <Select onValueChange={onTargetLangSelected} defaultValue={targetLanguage}>
            <SelectTrigger className="w-auto h-auto">
              <SelectValue placeholder="targetLang" />
            </SelectTrigger>
            <SelectContent key='2'>
              {
                languagesChoise.map((item, index) => {
                  return (
                    <SelectItem key={index} value={item.value}>{item.value}</SelectItem>
                  )
                })
              }
            </SelectContent>
          </Select>
          </div>
          <Toggle className="app-undragable" size="xs" variant="outline" onClick={onPinToggleClick}>
            {pinState ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
          </Toggle>
        </div>
        <Separator style={{ margin: '10px 0' }} />
        <div className="app-undragable flex w-full items-end space-x-2">
          <Textarea onChange={onTranslateTextChange} defaultValue={translateText} value={translateText} className="bg-slate-50 text-lg" placeholder="Translate context" />
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
        <ScrollArea className="app-undragable h-[23.5rem] w-full rounded-md border p-4">
          <Accordion type="single" defaultValue={defaultOpenValue} collapsible>
            <AccordionItem value="item-0">
              <AccordionTrigger>
                <Badge variant="outline-slate">{appConfig.model}</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <article className="prose lg:prose-xl">
                  <div id="markdownResult" ref={markdownResultRef} key={markdownResultKey}>
                    <ReactMarkdown>
                      {translateResult}
                    </ReactMarkdown>
                  </div>
                  <div id="scrollAreaEnd" ref={scrollAreaEndRef}></div>
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
