import { create, all, ConfigOptions } from 'mathjs';

// Create a mathjs instance with configuration
const config: ConfigOptions = {
  epsilon: 1e-12,     // Default epsilon
  matrix: 'Matrix',   // Use Matrix instead of standard Array
  number: 'BigNumber',// Crucial: Use BigNumber strictly to avoid floating point errors
  precision: 64,      // 64 digits of precision
  predictable: false,
  randomSeed: null
};

// Instantiate
export const math = create(all, config);

// A helper for ensuring the result is always a formatted string
export const formatResult = (value: unknown): string => {
  return math.format(value, { precision: 14 });
};
