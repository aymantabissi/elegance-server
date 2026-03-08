import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: 'YOUR_API_KEY' });

async function getProductRecommendations(category, priceRange) {
  const prompt = `
  Act as an intelligent product recommendation assistant. I will provide you with a product category and a target price range from my database. Your task is to recommend the best matching products based on these inputs.

  Category: ${category}
  Price Range: ${priceRange}

  Respond with:
  1. 3-5 relevant products that fit the category and price range
  2. For each product include:
     - Name (e.g., "Brand X Model Y")
     - Key Features (e.g., "8GB RAM, 128GB Storage")
     - Price (exact or closest match within the range)
     - Value Score (e.g., "Best Budget", "Premium Pick")
  3. If no products match, say: "No products found in this range. Try adjusting the price or category."
  4. Keep responses concise and user-friendly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return 'Sorry, I couldn\'t fetch recommendations at this time.';
  }
}

const ProductRecommender = () => {
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const handleRecommendationRequest = async () => {
    if (category && priceRange) {
      const results = await getProductRecommendations(category, priceRange);
      setRecommendations(results);
    } else {
      setRecommendations('Please fill in both category and price range.');
    }
  };

  return (
    <div>
      <h1>Product Recommender</h1>
      <div>
        <label>
          Category:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Smartphones"
          />
        </label>
      </div>
      <div>
        <label>
          Price Range:
          <input
            type="text"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="e.g. $200-$400"
          />
        </label>
      </div>
      <button onClick={handleRecommendationRequest}>Get Recommendations</button>

      <div>
        <h2>Recommendations:</h2>
        <div>{recommendations}</div>
      </div>
    </div>
  );
};

export default ProductRecommender;
