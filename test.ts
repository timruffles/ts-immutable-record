import tsImmutableRecord, { Create } from "./index";
import { execSync } from "child_process";
import { assert } from "chai";
import { writeFileSync } from "fs";

describe("immutable records, core API", function() {

  // compiling takes a while
  this.timeout(5000);

  let TestRecord: any;

  before(() => {
    TestRecord = compile({
      name: "TestRecord",
      fields: [
        {
          name: "startAt",
          type: "Date",
        },
        {
          name: "title",
          type: "string",
        },
      ],
    });
  })

  it("can be constructed without error", function() {
    const v = new TestRecord(1,2);
  })

  it("has constructor arguments in order of fields specified", function() {
    const date = new Date;
    const v = new TestRecord(date, "first");
    assert.equal(v.startAt, date);
    assert.equal(v.title, "first");
  })


  describe("deriving new instances", function() {
    it("returns values with new properties", function() {
      const original = new TestRecord(new Date, "hi");
      const derived = original.derive({ title: "bye" });
      assert.equal(derived.title, "bye");
    })

    it("leaves non-derived fields same on new record", function() {
      const dateA = new Date;
      const dateB = new Date(1232435435);
      const original = new TestRecord(dateA, "hi");
      const derived = original.derive({ startAt: dateB });
      assert.equal(derived.title, "hi");
    })
      
    it("returns same instance if someone derives a record with identical value", function() {
      const original = new TestRecord(new Date, "hi");
      const derived = original.derive({ title: "hi" });
      assert.equal(original, derived);
    })

    it("returns same instance if derived with empty update", function() {
      const original = new TestRecord(new Date, "hi");
      const derived = original.derive({ });
      assert.equal(original, derived);
    })
  })

  describe(".is", function() {
    assertMethodFollowsValueSemantics("is"); 
  })

  describe(".equals", function() {
    assertMethodFollowsValueSemantics("equals"); 
  })

  describe("importing is to save space", function() {
    let WithInlined: any;

    before(() => {
      WithInlined = compile({
        name: "TestRecord",
        isImportPath: "./is",
        fields: [
          {
            name: "title",
            type: "string",
          },
        ],
      });
    })

    it("can use imported 'is(a,b)'", function() {
      assert(new WithInlined("hi").is(new WithInlined("hi")));
    })
      
  })

  function assertMethodFollowsValueSemantics(method: string) {
    it("instances implement value equality", function() {
      assert(new TestRecord(new Date, "hi")[method](new TestRecord(new Date, "hi")));
    })

    it("value equality fails on different values", function() {
      assert.isFalse(new TestRecord(new Date, "hi")[method](new TestRecord(new Date, "hoo")));
    })
  }

    
  
})

function compile(setup: Create) {
  const src = tsImmutableRecord(setup);

  const target = "./Record.ts";
  writeFileSync(target, src, { encoding: "utf8" });

  try {
    execSync(`tsc ${target} --outdir testTarget`);
  } catch(e) {
    throw Error(`compilation failed, stderr: ${e.output[1]}`);
  }

  return require("./testTarget/Record").default;
}
