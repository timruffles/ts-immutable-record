# Immutable Records for Typescript

[![Build Status](https://travis-ci.org/timruffles/ts-immutable-record.svg?branch=master)](https://travis-ci.org/timruffles/ts-immutable-record)

Typed Immutable records for TypeScript are a pain. Via code-generation, this module gives you the best of using plain objects - type-safety - with the value semantics you'll want to make efficient use of immutable data.

Currently there is no run-time prevention of mutation - if you fancy this, just `Object.freeze` the instances.

## Installation

```sh
npm install --save ts-immutable-record
```

## Usage

```sh
const createRecord = require("ts-immutable-record");

const sourceCode = compile({
  name: "Person",
  imports: `import { Age } from "../types";`,
  generics: [`Job`],
  fields: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "age",
      type: "Age",
    },
    {
      name: "job",
      type: "Job",
    },
  ],
})
```

