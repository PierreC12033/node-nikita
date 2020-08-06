
# `nikita.file.ini`

Write an object as .ini file. Note, we are internally using the [ini] module.
However, there is a subtle difference. Any key provided with value of 
`undefined` or `null` will be disregarded. Within a `merge`, it get more
prowerfull and tricky: the original value will be kept if `undefined` is
provided while the value will be removed if `null` is provided.

The `file.ini` function rely on the `file` function and accept all of its
config. It introduces the `merge` option which instruct to read the
target file if it exists and merge its parsed object with the one
provided in the `content` option.

## Options   

* `backup` (string|boolean)   
  Create a backup, append a provided string to the filename extension or a
  timestamp if value is not a string, only apply if the target file exists and
  is modified.
* `clean` (boolean)   
  Remove all the lines whithout a key and a value, default to "true".
* `content` (object)   
  Object to stringify.
* `escape` (boolean)   
  Escape the section''s header title replace '.' by '\.'; "true" by default.
* `merge` (boolean)   
  Read the target if it exists and merge its content.
* `parse` (function)   
  User-defined function to parse the content from ini format, default to
  `require('ini').parse`, see 'misc.ini.parse\_multi\_brackets'.
* `stringify` (function)   
  User-defined function to stringify the content to ini format, default to
  `require('ini').stringify`, see 'misc.ini.stringify\_brackets\_then_curly' for
  an example.
* `eol` (string)   
  Characters for line delimiter, usage depends on the stringify option, with 
  the default stringify option, default to unix style if executed remotely 
  (SSH) or to the platform if executed locally ("\r\n for windows", 
  "\n" otherwise)
* `source` (string)   
  Path to a ini file providing default config; lower precedence than the
  content object; may be used conjointly with the local option; optional, use
  should_exists to enforce its presence.
* `target` (string)   
  File path where to write content to or a callback.

Available values for the `stringify` option are:

* `stringify`
  Default, implemented by `require('nikita/lib/misc/ini').stringify`
* `stringify`
  Default, implemented by `require('nikita/lib/misc/ini').stringify`

The default stringify function accepts:

* `separator` (string)   
  Characteres used to separate keys from values; default to " : ".

## Callback parameters

* `err`   
  Error object if any.   
* `status`   
  Indicate a change in the target file.   

## Example

```js
require('nikita')
.file.ini({
  content: {
    'my_key': 'my value'
  },
  target: '/tmp/my_file'
}, function(err, {status}){
  console.log(err ? err.message : 'Content was updated: ' + status);
});
```

## On config

    on_action = ({config}) ->
      # Normalization
      config.clean ?= true
      config.escape ?= true
      config.content ?= {}
      config.encoding ?= 'utf8'
      # Validation
      throw Error "Required Option: one of 'content' or 'source' is mandatory" unless config.content or not config.source
      throw Error "Required Option: option 'target' is mandatory" unless config.target

## Schema

    schema =
      # name: '@nikitajs/core/lib/file/ini'
      # $ref: '@nikitajs/core/lib/file'
      type: 'object'
      properties:
        'clean': type: 'boolean'
        'content': type: 'object'
        'escape': type: 'boolean'
        'merge': type: 'boolean'
        'parse': typeof: 'function'
        'stringify': typeof: 'function'
        'eol': type: 'string'

## Handler

    handler = ({config, log}) ->
      log message: "Entering file.ini", level: 'DEBUG', module: 'nikita/lib/file/ini'
      org_props = {}
      default_props = {}
      parse = config.parse or ini.parse
      # Original properties
      try
        data = await @fs.base.readFile
          target: config.target
          encoding: config.encoding
        org_props = parse(data, config)
      catch err
        throw err if err.code isnt 'NIKITA_FS_CRS_TARGET_ENOENT'
      # Default properties
      if config.source
        try
          data = await @fs.base.readFile
            ssh: if config.local then false else config.ssh
            sudo: if config.local then false else config.sudo
            target: config.source
            encoding: config.encoding
          content = ini.clean config.content, true
          config.content = merge parse(data, config), config.content
        catch err
          throw err if err.code isnt 'NIKITA_FS_CRS_TARGET_ENOENT'
      # Merge
      if config.merge
        config.content = merge org_props, config.content
        log message: "Get content for merge", level: 'DEBUG', module: 'nikita/lib/file/ini'
      if config.clean
        log message: "Clean content", level: 'INFO', module: 'nikita/lib/file/ini'
        ini.clean config.content
      log message: "Serialize content", level: 'DEBUG', module: 'nikita/lib/file/ini'
      stringify = config.stringify or ini.stringify
      @file
        target: config.target
        content: stringify config.content, config
        backup: config.backup
        diff: config.diff
        eof: config.eof
        gid: config.gid
        uid: config.uid
        mode: config.mode
      {}

## Exports

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      schema: schema

## Dependencies

    ini = require './utils/ini'
    {merge} = require 'mixme'

[ini]: https://github.com/isaacs/ini
