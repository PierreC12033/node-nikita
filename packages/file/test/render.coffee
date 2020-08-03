
nikita = require '@nikitajs/engine/src'
{tags, ssh, tmpdir} = require './test'
they = require('ssh2-they').configure ssh...

return unless tags.posix

describe 'file.render', ->

  describe 'error', ->

    they 'when option "source" doesnt exist', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @file.render
<<<<<<< HEAD
          source: "#{tmpdir}/oups.hbs"
          target: "#{tmpdir}/output"
          context: {}
        .should.be.rejectedWith message: "NIKITA_FS_CRS_TARGET_ENOENT: fail to read a file because it does not exist, location is \"#{tmpdir}/oups.hbs\"."
=======
          source: "#{tmpdir}/oups.mustache"
          target: "#{tmpdir}/output"
          context: {}
        .should.be.rejectedWith message: "NIKITA_FS_CRS_TARGET_ENOENT: fail to read a file because it does not exist, location is \"#{tmpdir}/oups.mustache\"."
>>>>>>> c3847c77... file: render and other minor refactoring

    they 'when option "context" is missing', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @file.render
          content: 'Hello {{ who }}'
          target: "#{tmpdir}/output"
        .should.be.rejectedWith message: 'NIKITA_SCHEMA_VALIDATION_CONFIG: one error was found in the configuration: #/required config should have required property \'context\'.' 

    they 'unsupported source extension', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @file.render
          source: 'gohome.et'
          target: "#{tmpdir}/output"
          context: {}
        .should.be.rejectedWith message: "Invalid Option: extension '.et' is not supported" 

<<<<<<< HEAD
  describe 'handlebars', ->
=======
  describe 'mustache', ->
>>>>>>> c3847c77... file: render and other minor refactoring

    they 'detect `source`', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.base.writeFile
<<<<<<< HEAD
          target: "#{tmpdir}/source.hbs"
          content: 'Hello {{ who }}'
          templated: false
        @file.render
          source: "#{tmpdir}/source.hbs"
=======
          target: "#{tmpdir}/source.mustache"
          content: 'Hello {{ who }}'
          templated: false
        @file.render
          source: "#{tmpdir}/source.mustache"
>>>>>>> c3847c77... file: render and other minor refactoring
          target: "#{tmpdir}/target.txt"
          context: who: 'you'
          templated: false
        .should.be.resolvedWith status: true
        @fs.assert
          target: "#{tmpdir}/target.txt"
          content: 'Hello you'

    they 'check autoescaping (disabled)', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.base.writeFile
<<<<<<< HEAD
          target: "#{tmpdir}/source.hbs"
          content: 'Hello "{{ who }}" \'{{ anInt }}\''
          templated: false
        @file.render
          source: "#{tmpdir}/source.hbs"
=======
          target: "#{tmpdir}/source.mustache"
          content: 'Hello "{{ who }}" \'{{ anInt }}\''
          templated: false
        @file.render
          source: "#{tmpdir}/source.mustache"
>>>>>>> c3847c77... file: render and other minor refactoring
          target: "#{tmpdir}/target.txt"
          context:
            who: 'you'
            anInt: 42
          templated: false
        .should.be.resolvedWith status: true
        @fs.assert
          target: "#{tmpdir}/target.txt"
          content: 'Hello "you" \'42\''
