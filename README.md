# electron-app

> Demo of te-app(translate english app)

## ScreenShot
![ss-1](./screenshot/image-1.png)
![ss-2](./screenshot/image-2.png)

## Usages

macOS can not open after installed, execute the command below then run again

```shell
sudo xattr -r -d com.apple.quarantine /Applications/te-app.app
```

## TODO
- [x] api quetsion tooltip
- [x] save configuration toast
- [x] send translate requets
- [x] add `translating`
- [x] use StreamEvent
- [x] swict source and target language

## Reference

- https://github.com/openai/openai-node

- https://www.builder.io/blog/stream-ai-javascript

- https://stackoverflow.com/questions/73547502/how-do-i-stream-openais-completion-api