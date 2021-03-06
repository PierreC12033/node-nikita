
class NikitaError extends Error
  constructor: (code, message, ...contexts) ->
    message = message.join(' ') if Array.isArray message
    super message
    if Error.captureStackTrace isnt undefined
      Error.captureStackTrace(this, NikitaError)
    this.code = code
    for context of contexts
      for key in context
        value = context[key]
        this[key] = if Buffer.isBuffer value
        then value.toString()
        else if value is null
        then value
        else JSON.parse JSON.stringify value

module.exports = ->
  new NikitaError ...arguments
