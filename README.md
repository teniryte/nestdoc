[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/teniryte/nestdoc/graphs/commit-activity) [![Maintaner](https://img.shields.io/badge/Maintainer-teniryte-blue)](https://img.shields.io/badge/maintainer-teniryte-blue) [![Website shields.io](https://img.shields.io/website-up-down-green-red/http/shields.io.svg)](https://nestdoc.sencort.com/) [![made-with-Markdown](https://img.shields.io/badge/Made%20with-Markdown-1f425f.svg)](http://commonmark.org) [![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/) [![GitHub license](https://img.shields.io/github/license/teniryte/nestdoc.svg)](https://github.com/teniryte/nestdoc/blob/master/LICENSE) [![Profile views](https://gpvc.arturio.dev/teniryte)](https://gpvc.arturio.dev/teniryte) [![GitHub contributors](https://img.shields.io/github/contributors/teniryte/nestdoc.svg)](https://GitHub.com/teniryte/nestdoc/graphs/contributors/) [![GitHub issues](https://img.shields.io/github/issues/teniryte/nestdoc.svg)](https://GitHub.com/teniryte/nestdoc/issues/)

[![GitHub forks](https://img.shields.io/github/forks/teniryte/nestdoc.svg?style=social&label=Fork&maxAge=2592000)](https://GitHub.com/teniryte/nestdoc/network/) [![GitHub stars](https://img.shields.io/github/stars/teniryte/nestdoc.svg?style=social&label=Star&maxAge=2592000)](https://GitHub.com/teniryte/nestdoc/stargazers/) [![GitHub watchers](https://img.shields.io/github/watchers/teniryte/nestdoc.svg?style=social&label=Watch&maxAge=2592000)](https://GitHub.com/teniryte/nestdoc/watchers/) [![GitHub followers](https://img.shields.io/github/followers/teniryte.svg?style=social&label=Follow&maxAge=2592000)](https://github.com/teniryte?tab=followers)

# nestdoc

Nest.JS documentation generator

## Installation

```sh
sudo npm install -g nestdoc
```

## CLI

```sh
# Input dir
nestdoc src
  # Output dir
  --output -o documentation
  # Watch mode
  --watch -w
  # Base url
  --base -b '/docs'
  # Custom logo
  --logo -l 'http://example.com/images/logo.png'
  # Custom favicon
  --favicon -f 'http://example.com/images/favicon.png'
  # Start server
  --serve -s
  # Server host
  --host -h 'localhost'
  # Server port
  --port -p 3000
```

## Documentation comments

```typescript
/**
 * Service description
 */
@Injectable()
export class MyService {
  constructor(
    /**
     * Property description
    */
    private readonly otherService: OtherService,
  ) {}

  /**
   * Method description
   * @args
   * - arg1: Arg 1 description
   * - arg2: Arg 2 description
   * @returns Return value description
   * @example
   * const result = await this.myService.myMethod(arg1, arg2);
   * @author Author Name <author@email.com>
   * @deprecated
   * @throws HttpException('Not found!', 404)
   * @throws HttpException('Forbidden', 402)
   * @todo
   * - Issue 1
   * - Issue 2
   */
  async myMethod(
    arg1: number,
    arg2: string,
  ): Promise<MyResult> {
    // Method body
  }
}

```
