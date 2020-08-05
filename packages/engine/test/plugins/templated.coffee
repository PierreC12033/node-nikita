
nikita = require '../../src'

describe 'plugins.templated', ->

  it 'access config', ->
    nikita
      key_1: 'value 1'
      key_2: 'value 2 and {{config.key_1}}'
      handler: ({config}) ->
        config
    .should.be.finally.containEql
      key_1: 'value 1'
      key_2: 'value 2 and value 1'
  
  it 'access parent', ->
    nikita
      key: 'value'
    , ->
      @call key: "get {{parent.config.key}} from parent", ({config}) -> config
      .should.be.finally.containEql
        key: 'get value from parent'

  it 'default', ->
    nikita.call ({metadata: {templated}}) ->
      templated.should.be.true()

  it 'when `false`', ->
    nikita.call
      templated: false
    , ({metadata: {templated}}) ->
      templated.should.be.false()

  it 'disable plugin', ->
    nikita
      templated: false
      key_1: 'value 1'
      key_2: 'value 2 and {{config.key_1}}'
      handler: ({config}) ->
        config
    .should.be.finally.containEql
      key_1: 'value 1'
      key_2: 'value 2 and {{config.key_1}}'

  it 'disable plugin in parent', ->
    nikita
      templated: false
      key: 'value'
    , ->
      @call key: "ignore {{parent.config.key}} from parent", ({config}) -> config
      .should.be.finally.containEql
        key: 'ignore {{parent.config.key}} from parent'

  it.only 'ignore some variables', ->
    nikita
      templated: filter: ['key_3']
      key_1: 'value 1'
      key_2: '{{config.key_1}}'
      key_3: '{{config.key_1}} and {{config.key_2}}'
      handler: ({config}) ->
        config
    .should.be.finally.containEql
      key_1: 'value 1'
      key_2: '{{config.key_1}}'
      key_3: 'value 1 and {{config.key_1}}'
