# Immutable Records for Typescript

[![Build Status](https://travis-ci.org/timruffles/ts-immutable-record.svg?branch=master)](https://travis-ci.org/timruffles/ts-immutable-record)

Typed Immutable records for TypeScript are a pain. Via code-generation, this module gives you the best of using plain objects - type-safety - with the value semantics you'll want to make efficient use of immutable data.

Currently there is no run-time prevention of mutation - if you fancy this, just `Object.freeze` the instances.

`.equals` and `.is` methods will ensure your comparisons follow value semantics: if all the values of two instances are indentical, the instances should be considered indentical.

## Installation

```sh
npm install --save ts-immutable-record
```

## Usage

This module works via code-generation, to enable type-safety through sufficiently granular typings.

Calling generate with:

```javascript
const sourceCode = createRecord({
  name: "Person",
  generics: [`Job`],
  fields: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "age",
      type: "number",
    },
    {
      name: "job",
      type: "Job",
    },
  ],
});
```

Will result in TypeScript source code that fulfills the below interface. As you can see, this also supports generating records with generics.

```typescript
export default class Person<Job> {
	new (
		public name: string,
		public age: number,
		public job: Job
	): Person;

	// returns a Person value with 0 .. many of the fields
	// differing to the current instance, with the rest using
	// the current instance's values. Will be `===` the original
	// if all values are equal to original values.
	derive(update: Update<Job>): Person<Job>;

	// two methods implementing value semantics
	equals(other: Person<{}>): boolean;
	is(other: Person<{}>): boolean;
};

export interface Update<Job> {
	name?: string
	age?: number
	job?: Job
}
```

### Runtime behaviour

Here's an example of the runtime APIs, running in ES6:

```javascript
const createRecord = require("ts-immutable-record");
onst fs = require("fs");
const assert = require("assert");


const sourceCode = createRecord({
  name: "Person",
  generics: [`Job`],
  fields: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "age",
      type: "number",
    },
    {
      name: "job",
      type: "Job",
    },
  ],
});

fs.writeFileSync("./Person.ts", sourceCode, { encoding: "utf8" });

// allow us to require Typescript files, compiled on demand
require("ts-node/register");

// generated code targets TS, so uses ES6 exports
const Person = require("./Person").default;

// stub version of Immutable's Map for this demo
class StubImmutableMap extends global.Map {
	// simple
	equals(m2) {
		for(const [k,v] of this) {
			if(m2.get(k) !== v) {
				return false;
			}
		}

		return true;
	}
}

function Map(kvs) {
	return new StubImmutableMap(Object.keys(kvs).map(k => [k, kvs[k]]));
}


const amy1 = new Person("amy", 32, Map({ title: "CEO" }));
const amy2 = new Person("amy", 32, Map({ title: "CEO" }));

assert(amy1.equals(amy2), "supports value equality via .equals");
assert(amy2.is(amy1), "supports value equality via .is");

const youngerAmy = amy2.derive({ age: 28 });
assert.notEqual(youngerAmy, amy2);
assert.equal(amy2.name, "amy", "other fields are not affected");


const amy4 = amy2.derive({ job: Map({ title: "VP "}) });
const amy5 = amy4.derive({ job: Map({ title: "CEO"}) });

assert(!amy4.is(amy2), "equality respects .equals methods of properties");
assert(amy5.is(amy2), "updating non-scalar values with .equals still reflects value semantic");
```

