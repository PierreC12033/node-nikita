// Generated by CoffeeScript 2.5.1
// {is_object, is_object_literal} = require 'mixme'
var error, exec, fs, os, path, process;

error = require('../utils/error');

os = require('os');

path = require('path');

process = require('process');

fs = require('ssh2-fs');

exec = require('ssh2-exec');

module.exports = function() {
  return {
    module: '@nikitajs/engine/src/metadata/status',
    require: ['@nikitajs/engine/src/plugins/operation_find', '@nikitajs/engine/src/plugins/operation_path'],
    hooks: {
      // 'nikita:registry:normalize': (action) ->
      //   action.metadata ?= {}
      //   if action.hasOwnProperty 'tmpdir'
      //     action.metadata.tmpdir = action.tmpdir
      //     delete action.tmpdir
      //   if action.hasOwnProperty 'dirty'
      //     action.metadata.dirty = action.dirty
      //     delete action.dirty
      'nikita:session:normalize': function(action) {
        if (action.hasOwnProperty('tmpdir')) {
          action.metadata.tmpdir = action.tmpdir;
          delete action.tmpdir;
        }
        if (action.hasOwnProperty('dirty')) {
          action.metadata.dirty = action.dirty;
          return delete action.dirty;
        }
      },
      'nikita:session:action': {
        after: '@nikitajs/engine/src/metadata/ssh',
        handler: async function(action, handler) {
          var err, now, rootdir, ssh, tmpdir;
          if (!action.metadata.tmpdir) {
            return handler;
          }
          // SSH connection extraction
          ssh = action.config.ssh === false ? void 0 : (await action.operations.find(function(action) {
            // action.state['nikita:ssh:connection']
            return action.ssh;
          }));
          tmpdir = ssh ? '/tmp' : os.tmpdir();
          // Generate temporary location
          rootdir = ssh ? '/tmp' : os.tmpdir();
          now = new Date();
          tmpdir = (function() {
            switch (typeof action.metadata.tmpdir) {
              case 'string':
                return action.metadata.tmpdir;
              case 'boolean':
                return ['nikita_', `${now.getFullYear()}`.substr(2), `${now.getMonth()}`.padStart(2, '0'), `${now.getDate()}`.padStart(2, '0'), '_', process.pid, '_', (Math.random() * 0x100000000 + 1).toString(36)].join('');
            }
          })();
          action.metadata.tmpdir = path.resolve(rootdir, tmpdir);
          try {
            // Temporary directory creation
            await fs.mkdir(ssh, action.metadata.tmpdir);
          } catch (error1) {
            err = error1;
            if (err.code !== 'EEXIST') {
              throw err;
            }
          }
          return handler;
        }
      },
      'nikita:session:result': {
        before: '@nikitajs/engine/src/metadata/ssh',
        handler: async function({action}) {
          var ssh, tmpdir;
          // Value of tmpdir could still be true if there was an error in
          // one of the on_action hook, such as a invalid schema validation
          if (typeof action.metadata.tmpdir !== 'string') {
            return;
          }
          if (action.metadata.dirty) {
            return;
          }
          // SSH connection extraction
          ssh = action.config.ssh === false ? void 0 : (await action.operations.find(function(action) {
            // action.state['nikita:ssh:connection']
            return action.ssh;
          }));
          // Ensure the location is correct
          tmpdir = ssh ? '/tmp' : os.tmpdir();
          if (!action.metadata.tmpdir.startsWith(tmpdir)) {
            throw error('METADATA_TMPDIR_CORRUPTION', ['the "tmpdir" metadata value does not start as expected,', `got ${JSON.stringify(action.metadata.tmpdir)},`, `expected to start with ${JSON.stringify(tmpdir)}`]);
          }
          // Temporary directory decommissioning
          return (await new Promise(function(resolve, reject) {
            return exec(ssh, `rm -r '${action.metadata.tmpdir}'`, function(err) {
              if (err) {
                return reject(err);
              } else {
                return resolve();
              }
            });
          }));
        }
      }
    }
  };
};
