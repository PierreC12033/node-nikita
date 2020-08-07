// Generated by CoffeeScript 2.5.1
var crypto, quote;

module.exports = {
  escapeshellarg: function(arg) {
    var result;
    result = arg.replace(/'/g, function(match) {
      return '\'"\'"\'';
    });
    return `'${result}'`;
  },
  /*
  `string.hash(file, [algorithm], callback)`
  ------------------------------------------
  Output the hash of a supplied string in hexadecimal
  form. The default algorithm to compute the hash is md5.
  */
  hash: function(data, algorithm) {
    if (arguments.length === 1) {
      algorithm = 'md5';
    }
    return crypto.createHash(algorithm).update(data).digest('hex');
  },
  repeat: function(str, l) {
    return Array(l + 1).join(str);
  },
  /*
  `string.endsWith(search, [position])`
  -------------------------------------
  Determines whether a string ends with the characters of another string,
  returning true or false as appropriate.
  This method has been added to the ECMAScript 6 specification and its code
  was borrowed from [Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith)
  */
  endsWith: function(str, search, position) {
    var lastIndex;
    position = position || str.length;
    position = position - search.length;
    lastIndex = str.lastIndexOf(search);
    return lastIndex !== -1 && lastIndex === position;
  },
  lines: function(str) {
    return str.split(/\r\n|[\n\r\u0085\u2028\u2029]/g);
  },
  max: function(str, max) {
    if (str.length > max) {
      return str.slice(0, max) + '…';
    } else {
      return str;
    }
  },
  print_time: function(time) {
    if (time > 1000 * 60) {
      `${time / 1000}m`;
    }
    if (time > 1000) {
      return `${time / 1000}s`;
    } else {
      return `${time}ms`;
    }
  },
  snake_case: function(str) {
    return str.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
  },
  // render: (options) ->
  //   @log message: "Rendering with #{options.engine}", level: 'DEBUG', module: 'nikita/lib/write'
  //   try
  //     switch options.engine
  //       when 'nunjunks'
  //         env = new nunjucks.Environment null, autoescape: false
  //         options.filters ?= {}
  //         options.filters.isString ?= (obj) -> typeof obj is 'string'
  //         options.filters.isArray ?= (obj) -> Array.isArray obj
  //         options.filters.isObject ?= (obj) -> typeof obj is 'object' and not Array.isArray obj
  //         options.filters.contains ?= (arr, obj) -> if Array.isArray arr then obj in arr else false
  //         options.filters.isEmpty ?= (obj) ->
  //           return true if !obj? or obj is ''
  //           return true if Array.isArray obj and obj.length is 0
  //           return true if typeof obj is 'object' and Object.keys(obj).length is 0
  //           return false
  //         for filter, func of options.filters
  //           if typeof func is 'function'
  //             env.addFilter filter, func
  //           else
  //             @log message: "Option filter not a function and ignored", level: 'WARN', module: 'nikita/lib/write'
  //         options.content = env.renderString options.content.toString(), options.context
  //       else throw Error "Invalid engine: #{options.engine}"
  //   catch err
  //     throw (if typeof err is 'string' then Error(err) else err)
  replace_partial: function(options) {
    var from, from_index, i, len, linebreak, opts, orgContent, place_before, pos, posoffset, ref, ref1, res, results, to;
    if (!((ref = options.write) != null ? ref.length : void 0)) {
      return;
    }
    this.log({
      message: "Replacing sections of the file",
      level: 'DEBUG',
      module: 'nikita/lib/misc/string'
    });
    ref1 = options.write;
    results = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      opts = ref1[i];
      if (opts.match) {
        if (opts.match == null) {
          opts.match = opts.replace;
        }
        if (typeof opts.match === 'string') {
          this.log({
            message: "Convert match string to regexp",
            level: 'DEBUG',
            module: 'nikita/lib/misc/string'
          });
        }
        if (typeof opts.match === 'string') {
          opts.match = RegExp(`${quote(opts.match)}`, "mg");
        }
        if (!(opts.match instanceof RegExp)) {
          throw Error("Invalid match option");
        }
        if (opts.match.test(options.content)) {
          options.content = options.content.replace(opts.match, opts.replace);
          results.push(this.log({
            message: "Match existing partial",
            level: 'INFO',
            module: 'nikita/lib/misc/string'
          }));
        } else if (opts.place_before && typeof opts.replace === 'string') {
          if (typeof opts.place_before === "string") {
            opts.place_before = new RegExp(RegExp(`^.*${quote(opts.place_before)}.*$`, "mg"));
          }
          if (opts.place_before instanceof RegExp) {
            this.log({
              message: "Replace with match and place_before regexp",
              level: 'DEBUG',
              module: 'nikita/lib/misc/string'
            });
            posoffset = 0;
            orgContent = options.content;
            while ((res = opts.place_before.exec(orgContent)) !== null) {
              this.log({
                message: "Before regexp found a match",
                level: 'INFO',
                module: 'nikita/lib/misc/string'
              });
              pos = posoffset + res.index; //+ res[0].length
              options.content = options.content.slice(0, pos) + opts.replace + '\n' + options.content.slice(pos);
              posoffset += opts.replace.length + 1;
              if (!opts.place_before.global) {
                break;
              }
            }
            results.push(place_before = false); // if content
          } else {
            this.log({
              message: "Forgot how we could get there, test shall say it all",
              level: 'DEBUG',
              module: 'nikita/lib/misc/string'
            });
            linebreak = options.content.length === 0 || options.content.substr(options.content.length - 1) === '\n' ? '' : '\n';
            results.push(options.content = opts.replace + linebreak + options.content);
          }
        } else if (opts.append && typeof opts.replace === 'string') {
          if (typeof opts.append === "string") {
            this.log({
              message: "Convert append string to regexp",
              level: 'DEBUG',
              module: 'nikita/lib/misc/string'
            });
            opts.append = new RegExp(`^.*${quote(opts.append)}.*$`, 'mg');
          }
          if (opts.append instanceof RegExp) {
            this.log({
              message: "Replace with match and append regexp",
              level: 'DEBUG',
              module: 'nikita/lib/misc/string'
            });
            posoffset = 0;
            orgContent = options.content;
            results.push((function() {
              var results1;
              results1 = [];
              while ((res = opts.append.exec(orgContent)) !== null) {
                this.log({
                  message: "Append regexp found a match",
                  level: 'INFO',
                  module: 'nikita/lib/misc/string'
                });
                pos = posoffset + res.index + res[0].length;
                options.content = options.content.slice(0, pos) + '\n' + opts.replace + options.content.slice(pos);
                posoffset += opts.replace.length + 1;
                if (!opts.append.global) {
                  break;
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            }).call(this));
          } else {
            linebreak = options.content.length === 0 || options.content.substr(options.content.length - 1) === '\n' ? '' : '\n';
            results.push(options.content = options.content + linebreak + opts.replace);
          }
        } else {
          continue; // Did not match, try callback
        }
      } else if (opts.place_before === true) {
        results.push(this.log({
          message: "Before is true, need to explain how we could get here",
          level: 'INFO',
          module: 'nikita/lib/misc/string'
        }));
      } else if (opts.from || opts.to) {
        if (opts.from && opts.to) {
          from = RegExp(`(^${quote(opts.from)}$)`, "m").exec(options.content);
          to = RegExp(`(^${quote(opts.to)}$)`, "m").exec(options.content);
          if ((from != null) && (to == null)) {
            results.push(this.log({
              message: "Found 'from' but missing 'to', skip writing",
              level: 'WARN',
              module: 'nikita/lib/misc/string'
            }));
          } else if ((from == null) && (to != null)) {
            results.push(this.log({
              message: "Missing 'from' but found 'to', skip writing",
              level: 'WARN',
              module: 'nikita/lib/misc/string'
            }));
          } else if ((from == null) && (to == null)) {
            if (opts.append) {
              results.push(options.content += '\n' + opts.from + '\n' + opts.replace + '\n' + opts.to);
            } else {
              results.push(this.log({
                message: "Missing 'from' and 'to' without append, skip writing",
                level: 'WARN',
                module: 'nikita/lib/misc/string'
              }));
            }
          } else {
            results.push(options.content = options.content.substr(0, from.index + from[1].length + 1) + opts.replace + '\n' + options.content.substr(to.index));
          }
        } else if (opts.from && !opts.to) {
          from = RegExp(`(^${quote(opts.from)}$)`, "m").exec(options.content);
          if (from != null) {
            results.push(options.content = options.content.substr(0, from.index + from[1].length) + '\n' + opts.replace); // TODO: honors append
          } else {
            results.push(this.log({
              message: "Missing 'from', skip writing",
              level: 'WARN',
              module: 'nikita/lib/misc/string'
            }));
          }
        } else if (!opts.from && opts.to) {
          from_index = 0;
          to = RegExp(`(^${quote(opts.to)}$)`, "m").exec(options.content);
          if (to != null) {
            results.push(options.content = opts.replace + '\n' + options.content.substr(to.index)); // TODO: honors append
          } else {
            results.push(this.log({
              message: "Missing 'to', skip writing",
              level: 'WARN',
              module: 'nikita/lib/misc/string'
            }));
          }
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  }
};

// nunjucks = require 'nunjucks/src/environment'
quote = require('regexp-quote');

crypto = require('crypto');
