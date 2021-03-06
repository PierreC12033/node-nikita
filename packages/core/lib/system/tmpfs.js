// Generated by CoffeeScript 2.5.1
// # `nikita.system.tmpfs`

// Mount a directory with tmpfs.d as a [tmpfs](https://www.freedesktop.org/software/systemd/man/tmpfiles.d.html) configuration file.

// ## Options

// * `age` (string)   
//   Used to decide what files to delete when cleaning.
// * `argument` (string)   
//   the destination path of the symlink if type is `L`.
// * `backup` (string|boolean)   
//   Create a backup, append a provided string to the filename extension or a
//   timestamp if value is not a string, only apply if the target file exists and
//   is modified.
// * `mount` (string)   
//   The mount point dir to create on system startup.
// * `name` (string)   
//   The file name, can not be used with target. If only options.name is set, it
//   writes the content to default configuration directory and creates the file 
//   as '`name`.conf'.
// * `target` (string)   
//   File path where to write content to. Defined to /etc/tmpfiles.d/{options.uid}.conf
//   if uid is defined or /etc/tmpfiles.d/default.conf.
// * `gid` (string|integer)   
//   File group name or group id.
// * `Perm` (string)   
//   target mount path mode in string format like `'0644'`.
// * `merge` (boolean)   
//    Overrides properties if already exits.
// * `uid` (string|integer)   
//   File user name or user id.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   Wheter the directory was mounted or already mounted.

// # Example

// All parameters can be omitted except type. nikita.tmpfs will ommit by replacing 
// the undefined value as '-', which does apply the os default behavior.

// Setting uid/gid to '-', make the os creating the target owned by root:root. 

// ## Source Code
var merge, misc;

module.exports = function({options}) {
  var i, key, len, ref, ssh;
  this.log({
    message: "Entering tmpfs action",
    level: 'DEBUG',
    module: 'nikita/tmpfs/index'
  });
  // SSH connection
  ssh = this.ssh(options.ssh);
  if (options.mount == null) {
    // Options
    throw Error('Missing Mount Point');
  }
  // for now only support directory type path option
  if (options.merge == null) {
    options.merge = true;
  }
  if (options.backup == null) {
    options.backup = true;
  }
  if (options.perm == null) {
    options.perm = '0644';
  }
  options.content = {};
  options.content[options.mount] = {};
  ref = ['mount', 'perm', 'uid', 'gid', 'age', 'argu'];
  for (i = 0, len = ref.length; i < len; i++) {
    key = ref[i];
    options.content[options.mount][key] = options[key];
  }
  options.content[options.mount]['type'] = 'd';
  if (options.uid != null) {
    if (!/^[0-9]+/.exec(options.uid)) {
      if (options.name == null) {
        options.name = options.uid;
      }
    }
  }
  if (options.target == null) {
    options.target = options.name != null ? `/etc/tmpfiles.d/${options.name}.conf` : '/etc/tmpfiles.d/default.conf';
  }
  this.log({
    message: `target set to ${options.target}`,
    level: 'DEBUG',
    module: 'nikita/tmpfs/index'
  });
  this.call({
    shy: true,
    if: options.merge
  }, function(_, callback) {
    this.log({
      message: "opening target file for merge",
      level: 'DEBUG',
      module: 'nikita/tmpfs/index'
    });
    return this.fs.readFile({
      target: options.target,
      encoding: 'utf8'
    }, function(err, {data}) {
      var source;
      if (err) {
        if (err.code === 'ENOENT') {
          return callback(null, false);
        }
        if (err) {
          return callback(err);
        }
      } else {
        source = misc.tmpfs.parse(data);
        options.content = merge(source, options.content);
        this.log({
          message: "content has been merged",
          level: 'DEBUG',
          module: 'nikita/tmpfs/index'
        });
        return callback(null, false);
      }
    });
  });
  return this.call(function() {
    this.file(options, {
      content: misc.tmpfs.stringify(options.content),
      merge: false,
      target: options.target
    });
    return this.call({
      if: function() {
        return this.status(-1);
      }
    }, function() {
      this.log({
        message: `re-creating ${options.mount} tmpfs file`,
        level: 'INFO',
        module: 'nikita/tmpfs/index'
      });
      this.system.execute({
        cmd: `systemd-tmpfiles --remove ${options.target}`
      });
      return this.system.execute({
        cmd: `systemd-tmpfiles --create ${options.target}`
      });
    });
  });
};

// ## Dependencies
misc = require('../misc');

({merge} = require('mixme'));

// [conf-tmpfs]: https://www.freedesktop.org/software/systemd/man/tmpfiles.d.html
