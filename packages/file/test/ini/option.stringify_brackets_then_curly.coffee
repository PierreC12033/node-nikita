
nikita = require '@nikitajs/engine/src'
{tags, ssh, tmpdir} = require '../test'
they = require('ssh2-they').configure ssh...
utils = require '../../src/utils'

return unless tags.posix

describe 'file.ini option stringify_brackets_then_curly', ->
  
  # TODO: move to `utils.ini` tests

  they 'call stringify udf', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.ini
        stringify: utils.ini.stringify_brackets_then_curly
        target: "#{tmpdir}/user.ini"
        content: user: preference: color: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.ini"
        content: '[user]\n preference = {\n  color = true\n }\n\n'

  they 'convert array to multiple keys', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      # Create a new file
      @file.ini
        stringify: utils.ini.stringify_brackets_then_curly
        target: "#{tmpdir}/user.ini"
        content: user: preference: language: ['c', 'c++', 'ada']
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.ini"
        content: '[user]\n preference = {\n  language = c\n  language = c++\n  language = ada\n }\n\n'
      # Modify an existing file
      # TODO: merge is not supported
