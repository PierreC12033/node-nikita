// Generated by CoffeeScript 2.5.1
var error,
  indexOf = [].indexOf;

error = require('../utils/error');

module.exports = function() {
  return {
    module: '@nikitajs/engine/src/metadata/relax',
    hooks: {
      'nikita:session:normalize': function(action) {
        // Move property from action to metadata
        if (action.hasOwnProperty('relax')) {
          action.metadata.relax = action.relax;
          return delete action.relax;
        }
      },
      'nikita:session:action': function(action, handler) {
        var base;
        if ((base = action.metadata).relax == null) {
          base.relax = false;
        }
        if (typeof action.metadata.relax === 'string' || action.metadata.relax instanceof RegExp) {
          action.metadata.relax = [action.metadata.relax];
        }
        if (!(typeof action.metadata.relax === 'boolean' || action.metadata.relax instanceof Array)) {
          throw error('METADATA_RELAX_INVALID_VALUE', ["configuration `relax` expect a boolean, string, array or regexp", `value, got ${JSON.stringify(action.metadata.relax)}.`]);
        }
        if (!action.metadata.relax) {
          return handler;
        }
        return function(action) {
          var args;
          args = arguments;
          return new Promise(function(resolve, reject) {
            var err, prom;
            try {
              prom = handler.apply(action.context, args);
              // Not, might need to get inspiration from retry to 
              // handle the returned promise
              return prom.then(resolve).catch(function(err) {
                var ref;
                if (typeof action.metadata.relax === 'boolean' || (ref = err.code, indexOf.call(action.metadata.relax, ref) >= 0) || action.metadata.relax.some(function(v) {
                  return err.code.match(v);
                })) {
                  resolve({
                    error: err
                  });
                }
                return reject(err);
              });
            } catch (error1) {
              err = error1;
              return resolve({
                error: err
              });
            }
          });
        };
      }
    }
  };
};
