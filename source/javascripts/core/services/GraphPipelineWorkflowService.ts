function validateParallel(parallel?: string | number) {
  const isEmpty = !parallel && parallel !== 0 && parallel !== '0';
  const isEnvVar = typeof parallel === 'string' && parallel.startsWith('$');
  const isPositiveInteger = isIntegerValue(parallel) && Number(parallel) > 0;

  if (isEmpty || isEnvVar || isPositiveInteger) {
    return true;
  }

  return 'Parallel copies should be a positive integer or a valid environment variable.';
}

function isIntegerValue(value?: string | number) {
  return Number.isInteger(Number(value));
}

function asIntegerIfPossible(value?: string | number) {
  return isIntegerValue(value) ? Number(value) : value;
}

export default {
  isIntegerValue,
  validateParallel,
  asIntegerIfPossible,
};
