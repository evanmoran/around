fileModifiedTime = (filepath, cb) ->
  fs.stat filepath, (err, data) ->
    return cb(err, data) if err
    cb(err, data.mtime)

around = require '../src/around.js'

describe 'around', ->
  it 'should be an object', ->
    around.should.be.an 'object'

  describe '.extend()', ->

    it 'should be a function', ->
      around.extend.should.be.an 'function'

    it 'should add methods to Function.prototype', ->
      assert.isUndefined(Function.prototype.around, 'Function prototype has around')
      assert.isUndefined(Function.prototype.after, 'Function prototype has after')
      assert.isUndefined(Function.prototype.before, 'Function prototype has before')
      around.extend()
      Function.prototype.around.should.be.a 'function'
      Function.prototype.after.should.be.a 'function'
      Function.prototype.before.should.be.a 'function'

describe 'Function.prototype', ->

  add = (a,b)->a+b
  multiply = (a,b)->a*b

  thrower = (v) ->
    ->
      # console.log "throw#{v}"
      throw v

  minus = (v) ->
    (n) ->
      # console.log "minus#{v}: ", n
      n-v

  plus = (v) ->
    (n) ->
      # console.log "plus#{v}: ", n
      n+v

  times = (v) ->
    (n) ->
      # console.log "times#{v}: ", n
      n*v

  divide = (v) ->
    (n) ->
      # console.log "divide#{v}: ", n
      n/v

  Function.prototype.trace = (arr) ->
    throw 'trace expects array' unless _.isArray arr
    fnSelf = @
    fnSelf.around (->
      arr.push {in: arguments}
    ), ((rval)->
      arr[arr.length-1].out = rval
    )

  describe '.before', ->
    it 'one cut', ->
      plus(5)(4).should.equal 9
      minus(7)(4).should.equal -3
      minus7_plus5 = plus(5).before(minus(7))
      minus7_plus5(12).should.equal 10
      minus7_plus5(14).should.equal 12

    it 'many cuts', ->
      times(3)(4).should.equal 12
      times3_minus7_plus5 = plus(5).before(minus(7)).before(times(3))
      times3_minus7_plus5(3).should.equal ((3*3)-7)+5

      plus5_times3_minus7 = minus(7).before(times(3)).before(plus(5))
      plus5_times3_minus7(3).should.equal ((3+5)*3)-7

    it 'multiple argument pass through', ->
      sumOfSquares = add.before (a,b) -> [a*a, b*b]
      sumOfSquares(2,3).should.equal 2*2+3*3

    it 'skip with around.breaker', ->
      yesThrow = thrower(5).before -> 7
      assert.throw yesThrow, 'yesThrow should throw'

      noThrow = thrower(5).before -> around.breaker
      assert.doesNotThrow noThrow, 'noThrow should not throw'
      assert.isUndefined noThrow(), 'noThrow should return undefined and not throw'

      noThrowWithResult = thrower(5).before -> [around.breaker, 7]
      assert.equal noThrowWithResult(), 7, 'noThrowWithResult should result a result'

  describe '.after', ->
    it 'one cut', ->
      plus5_minus7 = plus(5).after(minus(7))
      plus5_minus7(12).should.equal 10
      plus5_minus7(14).should.equal 12

    # it 'many cuts', ->
    #   times(3)(4).should.equal 12
    #   plus5_minus7_times3 = plus(5).after(minus(7)).after(times(3))
    #   plus5_minus7_times3(3).should.equal ((3+5)-7)*3

    #   minus7_times3_plus5 = minus(7).after(times(3)).after(plus(5))
    #   minus7_times3_plus5(3).should.equal ((3-7)*3)+5

  # describe '.around', ->
  #   it 'a', ->
  #     arr = []
  #     add_ = add.trace arr
  #     add_ 3,10
  #     console.log 'arr: ', arr

  # class Door
  #   constructor: (@_state) ->
  #   open: ->
  #     @_state = 'open'
  #     'door is open'
  #   close: ->
  #     @_state = 'closed'
  #     'door is closed'
  #   changeTo: (state) ->
  #     if state == 'open'
  #       @open()
  #     else if state == 'closed'
  #       @closed()

  # electrifyDoor = (door, electricitySwitch) ->
  #   door.open = door.open.prototype.before ->
  #     # Prevent open if there is no electricity
  #     if not electricitySwitch
  #       return around.breaker('door cannot open without electricity')

  #   door.close = door.close.prototype.before ->
  #     # Prevent close if there is no electricity
  #     return around.breaker unless electricitySwitch

  #   door.changeTo = door.close.prototype.before ->
  #     # Prevent close if there is no electricity
  #     return around.breaker unless electricitySwitch


  #   door.open = door.open.prototype.before ->
  #     'the door needs electricity to open'

  # # Door property
  # _doorOpen = true
  # door = (state) ->
  #   return state if state?
  #   _doorState = state

  # _electricityOn = true
  # electricDoor = door.before (doorState) ->
  #   # Pass through gets
  #   return if doorState?
  #   # Door doesn't open if electricity is off
  #   return false unless _electricityOn
  #   # Otherwise it behaves normally. Pass through argument
  #   doorState

  # describe '.before', ->
  #   it 'electric doors', ->
  #     door(true)
  #     (door()).should.equal true
  #     door(false)
  #     (door()).should.equal false
  #     door(true)
  #     (door()).should.equal true




