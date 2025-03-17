const negativeValue = (value) => {
  if (value < 0) {
    return `(${Math.abs(value)})`;
  }
  return value.toString();
};

export default negativeValue;