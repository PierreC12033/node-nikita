// Generated by CoffeeScript 2.5.1
// # Registry

// Management facility to register and unregister actions.

// ## Register all functions
var is_object, load, merge, mutate, registry;

load = function(middleware) {
  var ref, result;
  if (!(typeof middleware === 'object' && (middleware != null) && !Array.isArray(middleware))) {
    middleware = {
      handler: middleware
    };
  }
  if ((ref = typeof middleware.handler) !== 'function' && ref !== 'string') {
    throw Error(`Invalid middleware handler: got ${JSON.stringify(middleware.handler)}`);
  }
  if (typeof middleware.handler !== 'string') {
    return middleware;
  }
  middleware.module = middleware.handler;
  result = /^@nikitajs\/core\//.test(middleware.handler) ? require(`.${middleware.handler.substr(14 + 4)}`) : require.main.require(middleware.handler);
  if (typeof result === 'function') {
    result = {
      handler: result
    };
  }
  result.module = middleware.module;
  return result;
};

registry = function({chain, on_register, parent} = {}) {
  var obj, store;
  store = {};
  obj = {};
  // ## Get

  // Retrieve an action by name.

  // Options include: flatten, deprecate
  obj.get = function(name, options) {
    var actions, cnames, i, j, len, n, walk;
    if (arguments.length === 1 && is_object(arguments[0])) {
      options = name;
      name = null;
    }
    if (options == null) {
      options = {};
    }
    if (!name) {
      // Flatten result
      if (options.flatten) {
        actions = [];
        walk = function(store, keys) {
          var k, results, v;
          results = [];
          for (k in store) {
            v = store[k];
            if (k === '') {
              if (v.deprecate && !options.deprecate) {
                continue;
              }
              // flatstore[keys.join '.'] = merge v
              v.action = keys;
              results.push(actions.push(merge(v)));
            } else {
              results.push(walk(v, [...keys, k]));
            }
          }
          return results;
        };
        walk(store, []);
        return actions;
      } else {
        // Tree result
        walk = function(store, keys) {
          var k, res, v;
          res = {};
          for (k in store) {
            v = store[k];
            if (k === '') {
              if (v.deprecate && !options.deprecate) {
                continue;
              }
              res[k] = merge(v);
            } else {
              v = walk(v, [...keys, k]);
              if (Object.values(v).length !== 0) {
                res[k] = v;
              }
            }
          }
          return res;
        };
        return walk(store, []);
      }
    }
    if (typeof name === 'string') {
      name = [name];
    }
    cnames = store;
    for (i = j = 0, len = name.length; j < len; i = ++j) {
      n = name[i];
      if (!cnames[n]) {
        return null;
      }
      if (cnames[n] && cnames[n][''] && i === name.length - 1) {
        return cnames[n][''];
      }
      cnames = cnames[n];
    }
    return null;
  };
  // ## Register

  // Register new actions.

  // With an action path:

  // ```javascript
  // nikita.register('first_action', 'path/to/action')
  // nikita.first_action(options);
  // ```

  // With a namespace and an action path:

  // ```javascript
  // nikita.register(['second', 'action'], 'path/to/action')
  // nikita.second.action(options);
  // ```

  // With an action object:

  // ```javascript
  // nikita.register('third_action', {
  //   relax: true,
  //   handler: function(options){ console.log(options.relax) }
  // })
  // nikita.third_action(options);
  // ```

  // With a namespace and an action object:

  // ```javascript
  // nikita.register(['fourth', 'action'], {
  //   relax: true,
  //   handler: function(options){ console.log(options.relax) }
  // })
  // nikita.fourth.action(options);
  // ```

  // Multiple actions:

  // ```javascript
  // nikita.register({
  //   'fifth_action': 'path/to/action'
  //   'sixth': {
  //     '': 'path/to/sixth',
  //     'action': : 'path/to/sixth/actkon'
  //   }
  // })
  // nikita
  // .fifth_action(options);
  // .sixth(options);
  // .sixth.action(options);
  // ```
  obj.register = function(name, handler) {
    var cnames, j, n, ref, walk;
    if (typeof name === 'string') {
      name = [name];
    }
    if (Array.isArray(name)) {
      handler = load(handler);
      cnames = store;
      for (n = j = 0, ref = name.length; (0 <= ref ? j < ref : j > ref); n = 0 <= ref ? ++j : --j) {
        n = name[n];
        if (cnames[n] == null) {
          cnames[n] = {};
        }
        cnames = cnames[n];
      }
      cnames[''] = handler;
      if (on_register) {
        on_register(name, handler);
      }
    } else {
      walk = function(namespace, store) {
        var k, results, v;
        results = [];
        for (k in store) {
          v = store[k];
          if (k !== '' && v && typeof v === 'object' && !Array.isArray(v) && !v.handler) {
            namespace.push(k);
            results.push(walk(namespace, v));
          } else {
            v = load(v);
            namespace.push(k);
            store[k] = k === '' ? v : {
              '': v
            };
            if (on_register) {
              results.push(on_register(namespace, v));
            } else {
              results.push(void 0);
            }
          }
        }
        return results;
      };
      walk([], name);
      mutate(store, name);
    }
    return chain;
  };
  // ## Deprecate

  // `nikita.deprecate(old_function, [new_function], action)`

  // Deprecate an old or renamed action. Internally, it leverages 
  // [Node.js `util.deprecate`][deprecate].

  // For example:

  // ```javascript
  // nikita.deprecate('old_function', 'new_function', -> 'my_function')
  // nikita.new_function()
  // # Print
  // # (node:75923) DeprecationWarning: old_function is deprecated, use new_function
  // ```
  obj.deprecate = function(old_name, new_name, handler) {
    var action;
    if (arguments.length === 2) {
      handler = new_name;
      new_name = null;
    }
    action = load(handler);
    action.deprecate = new_name;
    if (typeof action.module === 'string') {
      if (action.deprecate == null) {
        action.deprecate = action.module;
      }
    }
    if (action.deprecate == null) {
      action.deprecate = true;
    }
    obj.register(old_name, action);
    return chain;
  };
  // # Registered

  // Test if a function is registered or not.

  // Options:

  // * `parent` (boolean)   
  //   Search action in the parent registries.
  // * `partial` (boolean)   
  //   Return true if name match a namespace and not a leaf action.
  obj.registered = function(name, options = {}) {
    var cnames, i, j, len, n;
    if (typeof name === 'string') {
      name = [name];
    }
    if (parent && parent.registered(name)) {
      return true;
    }
    cnames = store;
    for (i = j = 0, len = name.length; j < len; i = ++j) {
      n = name[i];
      if ((cnames[n] == null) || !cnames.propertyIsEnumerable(n)) {
        return false;
      }
      if (options.partial && cnames[n] && i === name.length - 1) {
        return true;
      }
      if (cnames[n][''] && i === name.length - 1) {
        return true;
      }
      cnames = cnames[n];
    }
    return false;
  };
  // ## Unregister

  // Remove an action from registry.
  obj.unregister = function(name) {
    var cnames, i, j, len, n;
    if (typeof name === 'string') {
      name = [name];
    }
    cnames = store;
    for (i = j = 0, len = name.length; j < len; i = ++j) {
      n = name[i];
      if (i === name.length - 1) {
        delete cnames[n];
      }
      cnames = cnames[n];
      if (!cnames) {
        return chain;
      }
    }
    return chain;
  };
  return obj;
};

module.exports = registry();

module.exports.registry = registry;

// ## Dependencies
({is_object, merge, mutate} = require('mixme'));

// [deprecate]: https://nodejs.org/api/util.html#util_util_deprecate_function_string
