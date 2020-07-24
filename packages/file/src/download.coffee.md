
# `nikita.file.download`

Download files using various protocols.

In local mode (with an SSH connection), the `http` protocol is handled with the
"request" module when executed locally, the `ftp` protocol is handled with the
"jsftp" and the `file` protocol is handle with the native `fs` module.

The behavior of download may be confusing wether you are running over SSH or
not. Its philosophy mostly rely on the target point of view. When download
run, the target is local, compared to the upload function where target
is remote.

A checksum may provided with the option "sha256", "sha1" or "md5" to validate the uploaded
file signature.

Caching is active if "cache_dir" or "cache_file" are defined to anything but false.
If cache_dir is not a string, default value is './'
If cache_file is not a string, default is source basename.

Nikita resolve the path from "cache_dir" to "cache_file", so if cache_file is an
absolute path, "cache_dir" will be ignored

If no cache is used, signature validation is only active if a checksum is
provided.

If cache is used, signature validation is always active, and md5sum is automatically
calculated if neither sha256, sh1 nor md5 is provided.

## Callback parameters

* `err` (Error)   
  Error object if any.
* `output.status` (boolean)   
  Value is "true" if file was downloaded.

## File example

```js
require('nikita')
.download({
  source: 'file://path/to/something',
  target: 'node-sigar.tgz'
}, function(err, {status}){
  console.info(err ? err.message : 'File downloaded ' + status)
})
```

## HTTP example

```javascript
require('nikita')
.file.download({
  source: 'https://github.com/wdavidw/node-nikita/tarball/v0.0.1',
  target: 'node-sigar.tgz'
}, (err, {status}) => {
  console.info(err ? err.message : 'File downloaded ' + status)
})
```

## TODO

It would be nice to support alternatives sources such as FTP(S) or SFTP.

## On config

    on_action = ({config, metadata}) ->
      # Options
      throw Error "Missing source: #{config.source}" unless config.source
      throw Error "Missing target: #{config.target}" unless config.target
      config.source = config.source.substr 7 if /^file:\/\//.test config.source
      stageDestination = null

## Schema

    schema =
      type: 'object'
      properties:
        'cache':
          type: 'boolean'
          default: false
          description: """
          Activate the cache, default to true if either "cache_dir" or "cache_file" is
          activated.
          """
        'cache_dir':
          type: 'string'
          description: """
          Path of the cache directory.
          """
        'cache_file':
          oneOf:[{type: 'string'}, {typeof: 'boolean'}]
          description: """
          Cache the file on the executing machine, equivalent to cache unless an ssh
          connection is provided. If a string is provided, it will be the cache path.
          By default: basename of source
          """
        'cookies':
          type: 'array', items: type: 'string'
          description: """
          Extra cookies  to include in the request when sending HTTP to a server.
          """
        'force':
          type: 'boolean'
          description: """
          Overwrite the target file if it exists.
          """
        'force_cache':
          type: 'boolean'
          description: """
          Force cache overwrite if it exists
          """
        'gid':
          oneOf: [{type: 'string'}, {type: 'number'}]
          description: """
          File group name or group id.
          """
        'http_headers':
          type: 'array', items: type: 'string'
          description: """
          Extra header to include in the request when sending HTTP to a server.
          """
        'location':
          type: 'boolean'
          description: """
          If the server reports that the requested page has moved to a different
          location (indicated with a Location: header and a 3XX response code), this
          option will make curl redo the request on the new place.
          """
        'md5':
          oneOf:[{type: 'string'}, {typeof: 'boolean'}]
          default: false
          description: """
          Validate uploaded file with md5 checksum (only for binary upload for now),
          may be the string checksum or will be deduced from source if "true".
          """
        'mode':
          type: 'integer'
          description: """
          File mode (permission and sticky bits), default to `0o0644`, in the
          form of `{mode: 0o0744}` or `{mode: "0744"}`.
          """
        'proxy':
          type: 'string'
          description: """
          Use the specified HTTP proxy. If the port number is not specified, it is
          assumed at port 1080. See curl(1) man page.
          """
        'sha1':
          default: false
          oneOf:[{type: 'string'}, {typeof: 'boolean'}]
          description: """
          Validate uploaded file with sha1 checksum (only for binary upload for now),
          may be the string checksum or will be deduced from source if "true".
          """
        'sha256':
          default: false
          oneOf:[{type: 'string'}, {typeof: 'boolean'}]
          description: """
          Validate uploaded file with sha1 checksum (only for binary upload for now),
          may be the string checksum or will be deduced from source if "true".
          """
        'source':
          type: 'string'
          description: """
          File, HTTP URL, GIT repository. File is the default protocol if source
          is provided without any.
          """
        'target':
          oneOf: [{type: 'string'}, {typeof: 'function'}]
          description: """
          File path where to write content to. Pass the content.
          """
        'uid':
          oneOf: [{type: 'string'}, {type: 'number'}]
          description: """
          File user name or user id.
          """

## Handler

    handler = ({config, log, metadata, operations: {status, events}, ssh}) ->
      log message: 'Entering file.download', level: 'DEBUG', module: 'nikita/lib/file/download'
      # SSH connection
      ssh = @ssh config.ssh
      p = if ssh then path.posix else path
      if config.md5?
        throw Error "Invalid MD5 Hash:#{config.md5}" unless typeof config.md5 in ['string', 'boolean']
        algo = 'md5'
        source_hash = config.md5
      else if config.sha1?
        throw Error "Invalid SHA-1 Hash:#{config.sha1}" unless typeof config.sha1 in ['string', 'boolean']
        algo = 'sha1'
        source_hash = config.sha1
      else if config.sha256?
        throw Error "Invalid SHA-256 Hash:#{config.sha256}" unless typeof config.sha256 in ['string', 'boolean']
        algo = 'sha256'
        source_hash = config.sha256
      else
        algo = 'md5'
      protocols_http = ['http:', 'https:']
      protocols_ftp = ['ftp:', 'ftps:']
      log message: "Using force: #{JSON.stringify config.force}", level: 'DEBUG', module: 'nikita/lib/file/download' if config.force
      source_url = url.parse config.source
      # Disable caching if source is a local file and cache isnt exlicitly set by user
      config.cache = false if not config.cache? and source_url.protocol is null
      config.cache ?= !!(config.cache_dir or config.cache_file)
      config.http_headers ?= []
      config.cookies ?= []
      # Normalization
      config.target = if config.cwd then p.resolve config.cwd, config.target else p.normalize config.target
      throw Error "Non Absolute Path: target is #{JSON.stringify config.target}, SSH requires absolute paths, you must provide an absolute path in the target or the cwd option" if ssh and not p.isAbsolute config.target
      # Shortcircuit accelerator:
      # If we know the source signature and if the target file exists
      # we compare it with the target file signature and stop if they match
      {status} = await @call shy: true, ->
        return true unless typeof source_hash is 'string'
        log message: "Shortcircuit check if provided hash match target", level: 'WARN', module: 'nikita/lib/file/download'
        try
          {hash} = await @fs.hash config.target, algo: algo
          source_hash is hash
        catch err
          if not err.code is 'NIKITA_FS_CRS_TARGET_ENOENT'
            throw err
      return status unless status
      log message: "Destination with valid signature, download aborted", level: 'INFO', module: 'nikita/lib/file/download'
      # Download the file and place it inside local cache
      # Overwrite the config.source and source_url properties to make them
      # look like a local file instead of an HTTP URL
      @file.cache
        if: config.cache
        # Local file must be readable by the current process
        ssh: false
        sudo: false
        source: config.source
        cache_dir: config.cache_dir
        cache_file: config.cache_file
        http_headers: config.http_headers
        cookies: config.cookies
        md5: config.md5
        proxy: config.proxy
        location: config.location
        target: config.target
      config.source = config.target if config.cache
      source_url = url.parse config.source
      # TODO
      # The current implementation seems inefficient. By modifying stageDestination,
      # we download the file, check the hash, and again treat it the HTTP URL 
      # as a local file and check hash again.
      {stats} = await @fs.base.stat
        target: config.target
        relax: 'NIKITA_FS_STAT_TARGET_ENOENT'
      if utils.stats.isDirectory stats?.mode
        log message: "Destination is a directory", level: 'DEBUG', module: 'nikita/lib/file/download'
        config.target = path.join config.target, path.basename config.source
      stageDestination = "#{config.target}.#{Date.now()}#{Math.round(Math.random()*1000)}"
      @call
        if: -> source_url.protocol in protocols_http
      , ->
        log message: "HTTP Download", level: 'DEBUG', module: 'nikita/lib/file/download'
        log message: "Download file from url using curl", level: 'INFO', module: 'nikita/lib/file/download'
        # Ensure target directory exists
        @fs.mkdir
          shy: true
          target: path.dirname stageDestination
        # Download the file
        @execute
          cmd: [
            'curl'
            '--fail' if config.fail
            '--insecure' if source_url.protocol is 'https:'
            '--location' if config.location
            ...("--header '#{header.replace '\'', '\\\''}'" for header in config.http_headers)
            ...("--cookie '#{cookie.replace '\'', '\\\''}'" for cookie in config.cookies)
            "-s #{config.source}"
            "-o #{stageDestination}"
            "-x #{config.proxy}" if config.proxy
          ].join ' '
          shy: true
        hash_source = hash_target = null
        {hash} = await @fs.hash stageDestination, algo: algo
        # Hash validation
        # Probably not the best to check hash, it only applies to HTTP for now
        if typeof source_hash is 'string' and source_hash isnt hash
          throw Error "Invalid downloaded checksum, found '#{hash}' instead of '#{source_hash}'" if source_hash isnt hash
        hash_source = hash
        {hash} = await @fs.hash
          target: config.target
          algo: algo
          relax: 'NIKITA_FS_STAT_TARGET_ENOENT'
        hash_target = hash
        @call ->
          match = hash_source is hash_target
          log if match
          then message: "Hash matches as '#{hash_source}'", level: 'INFO', module: 'nikita/lib/file/download' 
          else message: "Hash dont match, source is '#{hash_source}' and target is '#{hash_target}'", level: 'WARN', module: 'nikita/lib/file/download'
          not match
        @fs.remove
          # unless: -> @status -1
          shy: true
          target: stageDestination
      @call
        if: -> source_url.protocol not in protocols_http and not ssh
      , ->
        log message: "File Download without ssh (with or without cache)", level: 'DEBUG', module: 'nikita/lib/file/download'
        hash_source = hash_target = null
        {hash} = await @fs.hash target: config.source, algo: algo
        hash_source = hash
        {hash} = await @fs.hash target: config.target, algo: algo, if_exists: true
        hash_target = hash
        @call ->
          match = hash_source is hash_target
          log if match
          then message: "Hash matches as '#{hash_source}'", level: 'INFO', module: 'nikita/lib/file/download' 
          else message: "Hash dont match, source is '#{hash_source}' and target is '#{hash_target}'", level: 'WARN', module: 'nikita/lib/file/download'
          not match
        @fs.base.mkdir
          if: -> @status -1
          shy: true
          target: path.dirname stageDestination
        @fs.copy
          if: -> @status -2
          source: config.source
          target: stageDestination
      @call
        if: -> source_url.protocol not in protocols_http and ssh
      , ->
        log message: "File Download with ssh (with or without cache)", level: 'DEBUG', module: 'nikita/lib/file/download'
        hash_source = hash_target = null
        @fs.hash target: config.source, algo: algo, ssh: false, sudo: false, (err, {hash}) ->
          throw err if err
          hash_source = hash
        @fs.hash target: config.target, algo: algo, if_exists: true, (err, {hash}) ->
          throw err if err
          hash_target = hash
        @call ({}, callback)->
          match = hash_source is hash_target
          log if match
          then message: "Hash matches as '#{hash_source}'", level: 'INFO', module: 'nikita/lib/file/download' 
          else message: "Hash dont match, source is '#{hash_source}' and target is '#{hash_target}'", level: 'WARN', module: 'nikita/lib/file/download'
          callback null, not match
        @fs.mkdir
          if: -> @status -1
          shy: true
          target: path.dirname stageDestination
        @fs.createWriteStream
          if: -> @status -2
          target: stageDestination
          stream: (ws) ->
            rs = fs.createReadStream config.source
            rs.pipe ws
        , (err) ->
          log if err
          then message: "Downloaded local source #{JSON.stringify config.source} to remote target #{JSON.stringify stageDestination} failed", level: 'ERROR', module: 'nikita/lib/file/download'
          else message: "Downloaded local source #{JSON.stringify config.source} to remote target #{JSON.stringify stageDestination}", level: 'INFO', module: 'nikita/lib/file/download'
      @call ->
        log message: "Unstage downloaded file", level: 'DEBUG', module: 'nikita/lib/file/download'
        @system.move
          if: @status()
          source: stageDestination
          target: config.target
        @system.chmod
          if: config.mode?
          target: config.target
          mode: config.mode
        @system.chown
          if: config.uid? or config.gid?
          target: config.target
          uid: config.uid
          gid: config.gid

## Exports

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      schema: schema

## Module Dependencies

    fs = require 'fs'
    path = require('path').posix # need to detect ssh connection
    url = require 'url'
    utils = require '@nikitajs/engine/src/utils'
    curl = require '@nikitajs/engine/src/utils/curl'
