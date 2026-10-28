/** Adds up a list of numbers; 0 for an empty list. */
export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
