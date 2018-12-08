# Introduction

```js
const diffResult = require('diff-dependencies')(oldFolder, newFolder);
```

`diff-dependencies` will see differencies between `oldFolder` and `newFolder`, and returns all `removed` and `added` dependencies.

# Params

```js
const diffResult = require('diff-dependencies')(oldFolder, newFolder);
```

+   `oldFolder`

    absolute folder path that `package.json` and `package-lock.json` are in it.

+   `newFolder`

    absolute folder path that `package.json` and `package-lock.json` are in it.

# Return

It will return an object like:

```json
{
    "type": "update" or "package-file-not-exists",
    "added": {},
    "removed:: {}
}
```

# LICENSE 

MIT