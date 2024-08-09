declare interface IAppConfig {
  token: string
  api: string // default api
  prompt: string, // default translate prompt
  model: string // default model
}

declare interface IHeaders {
  accept?: string = 'application/json'
  authorization?: string
  'content-type'?: string
}

declare interface ITranslateRequest {
  url: string
  token: string
  text: string
  model: string
  prompt: string
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
  export default value;
}