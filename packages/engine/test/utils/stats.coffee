
utils = require '../../src/utils'
{tags} = require '../test'

return unless tags.api

describe 'utils.stats', ->

  describe 'isDirectory', ->

    it 'directory is true', ->
      mode = parseInt '40755', 8
      utils.stats.isDirectory(mode).should.be.true()

    it 'directory is false', ->
      mode = parseInt '100644', 8
      utils.stats.isDirectory(mode).should.be.false()
      
  describe 'isFile', ->

    it 'file is true', ->
      mode = parseInt '100644', 8
      utils.stats.isFile(mode).should.be.true()

    it 'file is false', ->
      mode = parseInt '40755', 8
      utils.stats.isFile(mode).should.be.false()
      
  describe 'type', ->

    it 'file is false', ->
      utils.stats.type(parseInt('40755', 8)).should.eql 'Directory'
      utils.stats.type(parseInt('100644', 8)).should.eql 'File'
      
  describe 'new', ->

    it 'file is false', ->
      utils.stats.new({
        mode: parseInt '100644', 8
      }).isFile().should.be.true()
