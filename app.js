const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package

// Initialize the app
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Conversion units for ingredients (you can expand this list)
const conversionTable = {
  "carrot": { unit: "carrot", conversion: { "cup": 2, "carrot": 1 } }, // 1 cup chopped ≈ 2 carrots
  "onion": { unit: "onion", conversion: { "cup": 1.5, "onion": 1 } },  // 1 cup chopped ≈ 1.5 onions
  "flour": { unit: "gram", conversion: { "cup": 120, "tablespoon": 8, "gram": 1 } },
  "sugar": { unit: "gram", conversion: { "cup": 200, "tablespoon": 12.5, "gram": 1 } }
  // Add more ingredients and conversions as needed
};

// Helper function to convert ingredient quantity to common unit
function convertToCommonUnit(ingredient, quantity, unit) {
  const item = conversionTable[ingredient];
  if (!item || !item.conversion[unit]) return null;

  // Convert to the standard unit
  return quantity * item.conversion[unit];
}

// Helper function to merge quantities of the same ingredient
function mergeIngredients(ingredientsList) {
  const shoppingList = {};

  ingredientsList.forEach(({ ingredient, quantity, unit }) => {
    const commonQuantity = convertToCommonUnit(ingredient, quantity, unit);

    if (commonQuantity !== null) {
      if (shoppingList[ingredient]) {
        shoppingList[ingredient].quantity += commonQuantity;
      } else {
        shoppingList[ingredient] = {
          unit: conversionTable[ingredient].unit,
          quantity: commonQuantity
        };
      }
    }
  });

  return shoppingList;
}

// POST endpoint to accept weekly recipes and return shopping list
app.post('/generate-shopping-list', (req, res) => {
  const { recipes } = req.body;
  if (!recipes || !Array.isArray(recipes)) {
    return res.status(400).send({ error: 'Invalid input, please provide an array of recipes.' });
  }

  console.log("Receiving recipes:", recipes);

  // Aggregate all ingredients across recipes
  const allIngredients = [];
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      allIngredients.push(ingredient);
    });
  });

  // Generate the shopping list with combined quantities
  const shoppingList = mergeIngredients(allIngredients);
  console.log("Sending shopping list:", shoppingList);
  res.json({ shoppingList });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
