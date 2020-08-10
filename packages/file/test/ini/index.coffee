
nikita = require '@nikitajs/engine/src'
{tags, ssh, tmpdir} = require '../test'
they = require('ssh2-they').configure ssh...

return unless tags.posix

describe 'file.ini', ->

  they 'stringify an object', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.ini
        content: user: preference: color: 'rouge'
        target: "#{tmpdir}/user.ini"
      .should.be.resolvedWith status: true
      @file.ini
        content: user: preference: color: 'rouge'
        target: "#{tmpdir}/user.ini"
      .should.be.resolvedWith status: false
      @fs.assert
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\ncolor = rouge\n'

  they 'merge an object', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = node\ncolor = rouge\n'
      @file.ini
        content: user: preference: color: 'violet'
        target: "#{tmpdir}/user.ini"
        merge: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = node\ncolor = violet\n'

  they 'discard undefined and null', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.ini
        content: user: preference: color: 'violet', age: undefined, gender: null
        target: "#{tmpdir}/user.ini"
        merge: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\ncolor = violet\n'
    

  they 'remove null within merge', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = node\ncolor = rouge\n'
      @file.ini
        content: user: preference: color: null
        target: "#{tmpdir}/user.ini"
        merge: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = node\n'

  they 'disregard undefined within merge', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = node\ncolor = rouge\n'
      @file.ini
        content: user: preference: color: undefined
        target: "#{tmpdir}/user.ini"
        merge: true
      .should.be.resolvedWith status: false

  they 'use default source file', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = node\n'
      @file.ini
        source: "#{tmpdir}/user.ini"
        target: "#{tmpdir}/test.ini"
        merge: false
      .should.be.resolvedWith status: true
      @file.ini
        source: "#{tmpdir}/user.ini"
        target: "#{tmpdir}/test.ini"
        merge: false
      .should.be.resolvedWith status: false
      @fs.assert
        target: "#{tmpdir}/test.ini"
        content: '[user.preference]\nlanguage = node\n'

  they 'options source file + content', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = node\n'
      @file.ini
        source: "#{tmpdir}/user.ini"
        target: "#{tmpdir}/test.ini"
        content: user: preference: remember: 'me'
        merge: false
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/test.ini"
        content: '[user.preference]\nlanguage = node\nremember = me\n'

  they 'options missing source file + content', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.ini
        source: "#{tmpdir}/does_not_exist.ini"
        target: "#{tmpdir}/test.ini"
        content: user: preference: remember: 'me'
        merge: false
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/test.ini"
        content: '[user.preference]\nremember = me\n'

  they 'options source file + merge', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = node\n'
      @file
        target: "#{tmpdir}/test.ini"
        content: '[user.preference]\nlanguage = c++\n'
      @file.ini
        source: "#{tmpdir}/user.ini"
        target: "#{tmpdir}/test.ini"
        merge: true
      .should.be.resolvedWith status: true
      @file.ini
        source: "#{tmpdir}/user.ini"
        target: "#{tmpdir}/test.ini"
        merge: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/test.ini"
        content: '[user.preference]\nlanguage = node\n'

  they 'use default source file with merge and content', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = node\n'
      @file
        target: "#{tmpdir}/test.ini"
        content: '[user.preference]\nlanguage = java\n'
      @file.ini
        source: "#{tmpdir}/user.ini"
        target: "#{tmpdir}/test.ini"
        content: user: preference: language: 'c++'
        merge: true
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/test.ini"
        content: '[user.preference]\nlanguage = c++\n'
      @file.ini
        source: "#{tmpdir}/user.ini"
        target: "#{tmpdir}/test.ini"
        content: user: preference: language: 'c++'
        merge: true
      # , (err, status) ->
      #   {status}.sh

  they 'generate from content object with escape', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.ini
        target: "#{tmpdir}/test.ini"
        escape: false
        content:
          "test-repo-0.0.1":
            'name': 'CentOS-$releasever - Base'
            'mirrorlist': 'http://test/?infra=$infra'
            'baseurl': 'http://mirror.centos.org/centos/$releasever/os/$basearch/'
            'gpgcheck': '1'
            'gpgkey': 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7'
      .should.be.resolvedWith status: true
      @file.ini
        target: "#{tmpdir}/test.ini"
        escape: false
        content:
          "test-repo-0.0.1":
            'name': 'CentOS-$releasever - Base'
            'mirrorlist': 'http://test/?infra=$infra'
            'baseurl': 'http://mirror.centos.org/centos/$releasever/os/$basearch/'
            'gpgcheck': '1'
            'gpgkey': 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7'
      .should.be.resolvedWith status: false
  
  they 'content encode string true correctly', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.ini
        target: "#{tmpdir}/test.ini"
        merge: true
        content: color: ui: 'true'
      @fs.assert
        target: "#{tmpdir}/test.ini"
        content: '[color]\nui = true\n'
