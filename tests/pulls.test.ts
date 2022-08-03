import { Pull } from "../src/types"
import { expect, test } from "@jest/globals"
import { shouldMerge } from "../src/pulls"

test("shouldMerge detects label with one", () => {
  const input: Pull = {
    number: 1,
    title: "Sample pull 1",
    head: {
      ref: "Branch1",
    },
    labels: [
      {
        name: "SomeLabel",
      },
    ],
  }

  const expected = true
  const actual = shouldMerge(input, "SomeLabel")

  expect(actual).toBe(expected)
})

test("shouldMerge detects label with two", () => {
  const input: Pull = {
    number: 1,
    title: "Sample pull 1",
    head: {
      ref: "Branch1",
    },
    labels: [
      {
        name: "SomeLabel",
      },
      {
        name: "AnotherLabel",
      },
    ],
  }

  const expected = true
  const actual = shouldMerge(input, "SomeLabel")

  expect(actual).toBe(expected)
})

test("shouldMerge false with different label", () => {
  const input: Pull = {
    number: 1,
    title: "Sample pull 1",
    head: {
      ref: "Branch1",
    },
    labels: [
      {
        name: "AnotherLabel",
      },
    ],
  }

  const expected = false
  const actual = shouldMerge(input, "SomeLabel")

  expect(actual).toBe(expected)
})

test("shouldMerge false with labels", () => {
  const input: Pull = {
    number: 1,
    title: "Sample pull 1",
    head: {
      ref: "Branch1",
    },
    labels: [],
  }

  const expected = false
  const actual = shouldMerge(input, "SomeLabel")

  expect(actual).toBe(expected)
})
