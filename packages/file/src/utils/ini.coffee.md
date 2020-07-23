
# Ini

    module.exports =
      # Remove undefined and null values
      clean: (content, undefinedOnly) ->
        for k, v of content
          if v and typeof v is 'object'
            content[k] = module.exports.clean v, undefinedOnly
            continue
          delete content[k] if typeof v is 'undefined'
          delete content[k] if not undefinedOnly and v is null
        content
