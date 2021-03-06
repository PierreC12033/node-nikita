// Generated by CoffeeScript 2.5.1
// # Registry

// Management facility to register and unregister actions.

// ## Register all functions
var create, is_object, merge, mutate, ventilate;

create = function({chain, on_register, parent} = {}) {
  var obj, store;
  store = {};
  obj = {
    chain: chain
  };
  // ## Create

  // Create a new registry.

  // Options include:

  // * `chain`   
  //   Default object to return, used by `register`, `deprecate` and `unregister`.
  //   Could be used to provide a chained style API.
  // * `on_register`   
  //   User function called on action registration. Takes two arguments: the action
  //   name and the action itself.
  // * `parent`   
  //   Parent registry.
  obj.create = function(options = {}) {
    // Inherit options from parent
    options = merge({
      chain: obj.chain,
      on_register: on_register,
      parent: parent
    }, options);
    // Create the child registry
    return create(options);
  };
  // ## load

  // Load an action from the module name.
  obj.load = function(module) {
    var action;
    if (typeof module !== 'string') {
      throw Error(`Invalid Argument: module must be a string, got ${module.toString()}`);
    }
    action = require.main.require(module);
    if (typeof action === 'function') {
      action = {
        handler: action
      };
    }
    if (action.metadata == null) {
      action.metadata = {};
    }
    action.metadata.module = middleware.module;
    return action;
  };
  // ## Get

  // Retrieve an action by name.

  // Options include:

  // * `flatten`
  // * `deprecate`
  obj.get = function(name, options) {
    var actions, child_store, i, j, len, n, ref, walk;
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
              if (v.metadata.deprecate && !options.deprecate) {
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
              if (v.metadata.deprecate && !options.deprecate) {
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
    child_store = store;
    ref = name.concat(['']);
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      n = ref[i];
      if (!child_store[n]) {
        break;
      }
      if (child_store[n] && i === name.length) {
        return child_store[n];
      }
      child_store = child_store[n];
    }
    if (parent) {
      return parent.get(name, options);
    } else {
      return null;
    }
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
  //   handler: function(options){ console.info(options.relax) }
  // })
  // nikita.third_action(options);
  // ```

  // With a namespace and an action object:

  // ```javascript
  // nikita.register(['fourth', 'action'], {
  //   relax: true,
  //   handler: function(options){ console.info(options.relax) }
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
  obj.register = async function(name, handler) {
    var action, child_store, i, j, property, ref, walk;
    if (typeof name === 'string') {
      name = [name];
    }
    if (Array.isArray(name)) {
      if (handler === void 0) {
        return obj.chain || obj;
      }
      if (typeof handler === 'string') {
        action = obj.load(handler);
      }
      if (typeof handler === 'function') {
        action = {
          handler: handler
        };
      } else {
        action = handler;
      }
      child_store = store;
      for (i = j = 0, ref = name.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        property = name[i];
        if (child_store[property] == null) {
          child_store[property] = {};
        }
        child_store = child_store[property];
      }
      [action] = ventilate([action]);
      child_store[''] = action;
      if (on_register) {
        await on_register(name, action);
      }
    } else {
      walk = async function(namespace, store) {
        var k, results, v;
        results = [];
        for (k in store) {
          v = store[k];
          if (k !== '' && v && typeof v === 'object' && !Array.isArray(v) && !v.handler) {
            namespace.push(k);
            results.push(walk(namespace, v));
          } else {
            if (typeof v.handler === 'string') {
              v = merge(v, obj.load(v));
            }
            if ((v.handler != null) && typeof v.handler !== 'function') {
              throw Error(`Invalid Handler: expect a function, got ${v.handler}`);
            }
            namespace.push(k);
            [v] = ventilate([v]);
            store[k] = k === '' ? v : {
              '': v
            };
            if (on_register) {
              results.push((await on_register(namespace, v)));
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
    return obj.chain || obj;
  };
  // ## Deprecate

  // `nikita.deprecate(old_function, [new_function], action)`

  // Deprecate an old or renamed action. Internally, it leverages 
  // [Node.js `util.deprecate`][deprecate].

  // For example:

  // ```javascript
  // nikita.deprecate('old_function', 'new_function', -> 'my_function')
  // nikita.old_function()
  // # Print
  // # (node:75923) DeprecationWarning: old_function is deprecated, use new_function
  // ```
  obj.deprecate = function(old_name, new_name, action) {
    var base, base1, handler;
    if (arguments.length === 2) {
      handler = new_name;
      new_name = null;
    }
    if (typeof action === 'string') {
      action = obj.load(action);
    }
    if (typeof handler === 'function') {
      action = {
        handler: handler
      };
    }
    if (action.metadata == null) {
      action.metadata = {};
    }
    action.metadata.deprecate = new_name;
    if (typeof action.module === 'string') {
      if ((base = action.metadata).deprecate == null) {
        base.deprecate = action.module;
      }
    }
    if ((base1 = action.metadata).deprecate == null) {
      base1.deprecate = true;
    }
    obj.register(old_name, action);
    return obj.chain || obj;
  };
  // # Registered

  // Test if a function is registered or not.

  // Options:

  // * `local` (boolean)   
  //   Search action in the parent registries.
  // * `partial` (boolean)   
  //   Return true if name match a namespace and not a leaf action.
  obj.registered = function(name, options = {}) {
    var child_store, i, j, len, n;
    if (typeof name === 'string') {
      name = [name];
    }
    if (!options.local && parent && parent.registered(name, options)) {
      return true;
    }
    child_store = store;
    for (i = j = 0, len = name.length; j < len; i = ++j) {
      n = name[i];
      if ((child_store[n] == null) || !child_store.propertyIsEnumerable(n)) {
        return false;
      }
      if (options.partial && child_store[n] && i === name.length - 1) {
        return true;
      }
      if (child_store[n][''] && i === name.length - 1) {
        return true;
      }
      child_store = child_store[n];
    }
    return false;
  };
  // ## Unregister

  // Remove an action from registry.
  obj.unregister = function(name) {
    var child_store, i, j, len, n;
    if (typeof name === 'string') {
      name = [name];
    }
    child_store = store;
    for (i = j = 0, len = name.length; j < len; i = ++j) {
      n = name[i];
      if (i === name.length - 1) {
        delete child_store[n];
      }
      child_store = child_store[n];
      if (!child_store) {
        return obj.chain || obj;
      }
    }
    return obj.chain || obj;
  };
  return obj;
};

module.exports = create();

// ## Dependencies
({is_object, merge, mutate} = require('mixme'));

({ventilate} = require('./args_to_actions'));

// [deprecate]: https://nodejs.org/api/util.html#util_util_deprecate_function_string
