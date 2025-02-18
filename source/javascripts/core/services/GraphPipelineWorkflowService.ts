function validateParallel(parallel?: string | number) {
  const isEmpty = !parallel && parallel !== 0 && parallel !== '0';
  const isEnvVar = typeof parallel === 'string' && parallel.startsWith('$');
  const isPositiveNumber = isNumericParallel(parallel) && Number(parallel) > 0;

  if (isEmpty || isEnvVar || isPositiveNumber) {
    return true;
  }

  return 'Parallel copies should be a positive number or a valid environment variable.';
}

function isNumericParallel(parallel?: string | number) {
  return !isNaN(Number(parallel));
}

function castParallel(parallel?: string | number) {
  return isNumericParallel(parallel) ? Number(parallel) : parallel;
}

export default {
  castParallel,
  validateParallel,
  isNumericParallel,
};
