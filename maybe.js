const daggy = require('daggy')
const {equals} = require('sanctuary-type-classes')

const Maybe = daggy.taggedSum('Maybe', {Just: ['val'], Nothing: []})

Maybe.fromNullable = function(val) {
  return val ? Maybe.Just(val) : Maybe.Nothing
}
const {Just, Nothing} = Maybe

/* Functor */
Maybe.prototype.map = function(fn) {
  return this.cata({
    Nothing: () => Nothing,
    Just: val => Just(fn(val))
  })
}

/* Setoid */
Maybe.prototype.equals = function(setoid) {
  return this.cata({
    Nothing: () => Nothing.is(setoid),
    Just: val => Just.is(setoid) && equals(val, setoid.val)
  })
}
Maybe.prototype[`fantasy-land/equals`] = Maybe.prototype.equals

/* Apply */
Maybe.prototype.ap = function(apply) {
  return this.cata({
    Nothing: () => Nothing,
    Just: val => this.map(apply.val)
  })
}

/* Applicatove */
Maybe.prototype.of = Just

/* Monad */
Maybe.prototype.chain = function(fn) {
  return this.cata({
    Nothing: () => Nothing,
    Just: val => fn(val)
  })
}

/* Semigroup */
Maybe.prototype.concat = function(semigroup) {
  return this.cata({
    Nothing: () => semigroup,
    Just: val => Maybe.Nothing.is(semigroup) ? this : val.concat(semigroup.val)
  })
}

/* Monoid */
Maybe.empty = function() {
  return Maybe.Nothing
} 

module.exports = Maybe
