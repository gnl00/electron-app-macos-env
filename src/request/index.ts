const authorizationPreffix = 'Bearer '

// const getHeanders: IHeaders = {}

const postHeanders: IHeaders = {
  'content-type': 'application/json',
  accept: 'application/json'
}

export const translateRequest = async (req: ITranslateRequest) => {
  if (!req.text) {
    console.log('translate text is empty')
    return
  }

  const initMessage = {
    role: 'user',
    content: req.prompt
  }

  const headers = {
    ...postHeanders,
    authorization: authorizationPreffix + req.token
  }

  console.log('request: ', req)
  
  const json = await fetch(req.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: req.model,
      messages: [
        {...initMessage},
        {
          role: 'user',
          content: req.text
        }
      ],
      stream: false,
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      frequency_penalty: 0.5,
      n: 1
    })
  }).then(resp => resp.json())
  .catch(err => {
    console.log('translateRequest ERROR', err)
  })

  console.log('json: ', json)

  return json
}

export const translateRequestWithHook = async (req: ITranslateRequest, beforeFetch: Function, afterFetch: Function): Promise<any> => {

  if (!req.text) {
    console.log('translate text is empty')
    return
  }

  const initMessage = {
    role: 'user',
    content: req.prompt
  }

  const headers = {
    ...postHeanders,
    authorization: authorizationPreffix + req.token
  }

  beforeFetch()

  const stream = await fetch(req.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: req.model,
      messages: [
        {...initMessage},
        {
          role: 'user',
          content: req.text
        }
      ],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      frequency_penalty: 0.5,
      n: 1
    })
  })

  const reader = stream.body?.pipeThrough(new TextDecoderStream()).getReader()

  afterFetch()

  return reader
}