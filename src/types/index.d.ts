interface IPrompt {
  embedded?: string | undefined // app embedded translate prompt
  custom?: string // user custom prompt
}

declare interface IAppConfig {
  token?: string
  api?: string // default api
  model?: string // default model
  prompt?: IPrompt, // prompt
  version?: number
  configForUpdate?: IAppConfig
}

declare type AppConfigType = Omit<IAppConfig, 'configUpdate'>

declare interface IHeaders {
  accept?: string
  authorization?: string
  'content-type'?: string
}

declare interface ITranslateRequest {
  url: string | undefined
  token: string | undefined
  model: string | undefined
  prompt: string
  text: string
  sourceLang: string
  targetLang: string
}

declare interface IBaseResponse {
  id: string
  object: string
  created: number
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  systemFingerprint: string
}

declare module "*.types";

declare module '*.png' {
  const value: string;
  export default value
}