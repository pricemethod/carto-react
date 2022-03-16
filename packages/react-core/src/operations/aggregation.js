import { AggregationTypes } from './constants/AggregationTypes';

const dummyFn = ([value]) => value;

export const aggregationFunctions = {
  [AggregationTypes.COUNT]: (values) => values.length,
  [AggregationTypes.MIN]: min,
  [AggregationTypes.MAX]: max,
  [AggregationTypes.SUM]: sum,
  [AggregationTypes.AVG]: avg
};

export function aggregate(feature, keys, operation) {
  const normalizedKeys = normalizeKeys(keys);

  if (!normalizedKeys?.length) {
    throw new Error('Cannot aggregate a feature without having keys');
  }

  const aggregationFn = aggregationFunctions[operation] || dummyFn;

  return aggregationFn(normalizedKeys.map((column) => feature[column]));
}

// Aggregation functions
function avg(values, ...args) {
  return sum(values, ...args) / (values.length || 1);
}

function sum(values, keys, joinOperation) {
  const normalizedKeys = normalizeKeys(keys);

  let sumFn = (a, b) => a + b;
  if (normalizedKeys) {
    sumFn = (a, b) => a + aggregate(b, normalizedKeys, joinOperation);
  }

  return values.reduce(sumFn, 0);
}

function min(values, keys, joinOperation) {
  const normalizedKeys = normalizeKeys(keys);
  if (normalizedKeys) {
    return values.reduce(
      (a, b) => Math.min(a, aggregate(b, normalizedKeys, joinOperation)),
      Infinity
    );
  } else {
    return Math.min(...values);
  }
}

function max(values, keys, joinOperation) {
  const normalizedKeys = normalizeKeys(keys);
  if (normalizedKeys) {
    return values.reduce(
      (a, b) => Math.max(a, aggregate(b, normalizedKeys, joinOperation)),
      -Infinity
    );
  } else {
    return Math.max(...values);
  }
}

// Aux

// Keys can come as a string (one column) or a string array (multiple column)
// Use always an array to make the code easier
function normalizeKeys(keys) {
  return keys?.length ? [keys].flat() : undefined;
}