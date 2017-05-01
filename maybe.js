const daggy = require('daggy')
const {equals} = require('sanctuary-type-classes')

const Maybe = daggy.taggedSum('Maybe', {Nothing: [], Just: ['val']})
const {Nothing, Just} = Maybe

/* Functor */
// map :: Functor f => f a ~> (a -> b) -> f b
Maybe.prototype.map = function(fn) {
  return this.cata({
    Nothing: () => Nothing,
    Just: val => Just(fn(val))
  })
}

/* Setoid */
// equals :: Setoid a => a ~> a -> Boolean
Maybe.prototype.equals = function(setoid) {
  return this.cata({
    Nothing: () => Nothing.is(setoid),
    Just: val => Just.is(setoid) && equals(val, setoid.val)
  })
}
Maybe.prototype[`fantasy-land/equals`] = Maybe.prototype.equals


/* Apply */
// ap :: Apply f => f a ~> f (a -> b) -> f b
Maybe.prototype.ap = function(apply) {
  return this.cata({
    Nothing: () => Nothing,
    Just: val => Just.is(apply)
      ? this.map(apply.val) : Nothing
  })
}


/* Applicatove */
// of :: Applicative f => a -> f a
Maybe.of = Just


/* Chain */
// chain :: Chain m => m a ~> (a -> m b) -> m b
Maybe.prototype.chain = function(fn) {
  return this.cata({
    Nothing: () => Nothing,
    Just: val => fn(val)
  })
}

/* Monad */
// Maybe is monad because it implements both Chain and Apply

/* Semigroup */
// concat :: Semigroup a => a ~> a -> a
Maybe.prototype.concat = function(semigroup) {
  return this.cata({
    Nothing: () => semigroup,
    Just: val => Maybe.Nothing.is(semigroup) ? this : val.concat(semigroup.val)
  })
}

/* Monoid */
// empty :: Monoid m => () -> m
Maybe.empty = function() {
  return Maybe.Nothing
} 

/* Alt */
//alt :: Alt f => f a ~> f a -> f a
Maybe.prototype.alt = function(that) {
  return this.cata({
    Nothing: () => that,
    Just: val => Just(val)
  })
}

/* Plus */
//zero :: Plus f => () -> f a
Maybe.zero = function() {
  return Nothing
}

/* Alternative */
// Maybe is alternative because it implements both Plus and Applicative

/* Outside specification */
maybeFromNullable = function(val) {
  return val ? Maybe.Just(val) : Maybe.Nothing
}

const maybeFork = (val, f, g) => {
  return Just.is(val) ? val.chain(g) : f()
}
