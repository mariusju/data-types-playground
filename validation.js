const daggy = require('daggy')
const {equals} = require('sanctuary-type-classes')
const {composeK, compose, chain, ap, concat} = require('ramda')

const Validation = daggy.taggedSum('Validation', {Failure: ['err'], Success: ['val']})
const {Failure, Success} = Validation

/* Functor */
// map :: Functor f => f a ~> (a -> b) -> f b
Validation.prototype.map = function(fn) {
  return this.cata({
    Failure: err => Failure(err),
    Success: val => Success(fn(val))
  })
}

/* Semigroup */
// concat :: Semigroup a => a ~> a -> a
Validation.prototype.concat = function(that) {
  return this.cata({
    Failure: err1 => that.cata({
      Failure: err2 => Failure(err1.concat(err2)),
      Success: val2 => Failure(err1)
    }),
    Success: val1 => that.cata({
      Failure: err2 => Failure(err2),
      Success: val2 => Success(val1)
    })
  })
}

/* Apply */
// ap :: Apply f => f a ~> f (a -> b) -> f b
Validation.prototype.ap = function(that) {
  return this.cata({
    Failure: err1 => that.cata({
      Failure: err2 => Failure(err1.concat(err2)),
      Success: val2 => Failure(err1)
    }),
    Success: val1 => that.cata({
      Failure: (err2) => Failure(err2),
      Success: (val2) => Success(val2(val1))
    })
  })
}

/* Applicative */
// of :: Applicative f => a -> f a
Validation.of = Success



/* Not specified */
const validationFork = (val, f, g) => {
  return Failure.is(val) ? f(val.err, val.val) : g(val.val)
}

/* helpers */

// errors stored in array
const rule = (f, err) => x => f(x) ? Success(x) : Failure([err])
 
// errors stored in array
const validate = (fs, x) => ap(fs, [x]).reduce(concat, Validation.of(x))

/* example */
const longerThan1 = rule(x => x.length > 1, 'should be longer than 1')
const longerThan2 = rule(x => x.length > 2, 'should be longer than 2')

const validationResult = validate([longerThan1, longerThan2], 'a')

validationFork(
  validationResult,
  errors => errors.forEach(err => console.log(err)),
  val => console.log(val, 'great success!')
)
  
