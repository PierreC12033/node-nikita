
nikita = require '@nikitajs/engine/src'
{tags, ssh, tmpdir} = require './test'
they = require('ssh2-they').configure ssh...

return unless tags.posix

describe 'file.yaml', ->

  they 'stringify an object', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.yaml
        content: user: preference: color: 'rouge'
        target: "#{tmpdir}/user.yml"
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.yml"
        content: 'user:\n  preference:\n    color: rouge\n'

  they 'merge an object', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.yml"
        content: 'user:\n  preference:\n    language: english\n'
      @file.yaml
        content: user: preference: language: 'french'
        target: "#{tmpdir}/user.yml"
        merge: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.yml"
        content: 'user:\n  preference:\n    language: french\n'

  they 'discard undefined and null', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.yaml
        content: user: preference: color: 'violet', age: undefined, gender: null
        target: "#{tmpdir}/user.yml"
        merge: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.yml"
        content: 'user:\n  preference:\n    color: violet\n'

  they 'remove null within merge', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.yml"
        content: 'user:\n  preference:\n    country: france\n    language: lovelynode\n    color: rouge\n'
      @file.yaml
        content: user: preference:
          color: 'rouge'
          language: null
        target: "#{tmpdir}/user.yml"
        merge: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.yml"
        content: 'user:\n  preference:\n    color: rouge\n    country: france\n'

  they 'disregard undefined within merge', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.yml"
        content: 'user:\n  preference:\n    language: node\n    name:    toto\n'
      @file.yaml
        target: "#{tmpdir}/user.yml"
        content: user: preference:
          language: 'node'
          name: null
        merge: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.yml"
        content: 'user:\n  preference:\n    language: node\n'

  they 'disregard undefined within merge', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.yml"
        content: 'user:\n  preference:\n    language: node\n  name: toto\ngroup: hadoop_user\n'
      @file.yaml
        ssh: ssh
        content:
          group: null
        target: "#{tmpdir}/user.yml"
        merge: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.yml"
        content: 'user:\n  preference:\n    language: node\n  name: toto\n'
