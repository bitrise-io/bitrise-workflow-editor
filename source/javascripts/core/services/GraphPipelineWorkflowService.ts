function validateParallel(parallel?: string | number) {
  if (!parallel || (typeof parallel === 'string' && parallel.startsWith('$')) || !isNaN(Number(parallel))) {
    return true;
  }

  return 'Parallel copies should be a number or a valid environment variable.';
}

export default {
  validateParallel,
};
