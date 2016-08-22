const createRecord = require("./ts-immutable-record");
const fs = require("fs");
const assert = require("assert");

require("ts-node/register");

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

const Person = require("./Person").default;

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

