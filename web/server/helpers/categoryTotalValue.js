const calculateCategoryTotal = (category) => {
  let total = 0;
  for (let i = 0; i < category.subcategories.length; i++) {
    total += category.subcategories[i].value;
  }
  return total;
};

const validateCategoryTotal = (category, userTotal) => {
  let calculatedTotal = calculateCategoryTotal(category);

  if (calculatedTotal !== userTotal) {
    return {
      isValid: false,
      calculatedTotal,
    };
  }

  return {
    isValid: true,
    calculatedTotal,
  };
};

export { validateCategoryTotal, calculateCategoryTotal };
