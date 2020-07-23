
# Yaml

    module.exports =
      merge: (original, new_obj, undefinedOnly) ->
        for k, v of original
          if v and typeof v is 'object' and typeof new_obj[k] isnt 'undefined'
            new_obj[k] = utils.yaml.merge v, new_obj[k], undefinedOnly
            continue
          new_obj[k] = v if typeof new_obj[k] is 'undefined'
        new_obj
      clean: (original, new_obj, undefinedOnly) ->
        for k, v of original
          if v and typeof v is 'object' and new_obj[k]
            original[k] = utils.yaml.clean v, new_obj[k], undefinedOnly
            continue
          delete original[k] if new_obj[k]  is null
        original
