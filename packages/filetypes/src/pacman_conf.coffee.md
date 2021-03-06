
`nikita.file.types.pacman_conf`

Pacman is a package manager utility for Arch Linux. The file is usually located 
in "/etc/pacman.conf".

## Options

* `rootdir` (string, optional, undefined)   
  Path to the mount point corresponding to the root directory, optional.
* `backup` (string|boolean, optional, false)   
  Create a backup, append a provided string to the filename extension or a
  timestamp if value is not a string, only apply if the target file exists and
  is modified.
* `clean` (boolean, optional, false)   
  Remove all the lines whithout a key and a value, default to "true".
* `content` (object, required)   
  Object to stringify.
* `merge` (boolean, optional, false)   
  Read the target if it exists and merge its content.
* `target` (string, optional, "/etc/pacman.conf")   
  Destination file.

## Source Code

    module.exports = ({options}) ->
      @log message: "Entering file.types.pacman_conf", level: 'DEBUG', module: 'nikita/lib/file/types/pacman_conf'
      options.target ?= '/etc/pacman.conf'
      options.target = "#{path.join options.rootdir, options.target}" if options.rootdir
      @file.ini
        stringify: misc.ini.stringify_single_key
      , options

## Dependencies

    path = require 'path'
    misc = require '@nikitajs/core/lib/misc'
