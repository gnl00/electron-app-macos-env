export declare interface IAppConfig {
  token: string
  api: string // default api
  prompt: string, // default translate prompt
  model: string // default model
}

export declare interface IHeaders {
  accept?: string = 'application/json'
  authorization?: string
  'content-type'?: string
}

export declare interface ITranslateRequest {
  url: string
  token: string
  text: string
  model: string
  prompt: string
}
