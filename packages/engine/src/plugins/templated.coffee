
templated = require 'self-templated'

module.exports = ->
  module: '@nikitajs/engine/src/plugins/template'
  hooks:
    'nikita:session:normalize': (action) ->
      # Move property from action to metadata
      if action.hasOwnProperty 'templated'
        action.metadata.templated = action.templated
        delete action.templated
      action.metadata.templated ?= {}
    'nikita:session:action': (action, handler) ->
      ->
        if action.metadata.templated isnt false and action.parent?.metadata.templated isnt false
          action.metadata.templated.config = {}
          for key of action.config
            if not action.metadata.templated.filter or action.metadata.templated.filter.includes key
              action.metadata.templated.config[key] = true
          console.log action.metadata.templated
          action = templated action,
            compile: false
            partial:
              # metadata: true
              # config: true
              metadata:
                templated:
                  config: true
          console.log action
        handler.call null, action
