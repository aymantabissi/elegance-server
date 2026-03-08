from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import time
from bson import ObjectId
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import LabelEncoder, StandardScaler
import numpy as np
import traceback


# Utility function to recursively convert ObjectId to string in any dict
def convert_objectid_to_str(obj):
    if isinstance(obj, list):
        return [convert_objectid_to_str(item) for item in obj]
    elif isinstance(obj, dict):
        return {
            key: convert_objectid_to_str(value)
            for key, value in obj.items()
        }
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

MONGO_URI = "mongodb+srv://aymanraisse7:QQjjz29Hu8RWqXEh@cluster0.945tp.mongodb.net/Products?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["Products"]
products_collection = db["products"]
users_collection = db["users"]  # Add access to the users collection

# Global variables for caching
products_df = None
cosine_sim = None
last_refreshed = 0
MODEL_REFRESH_INTERVAL = 600  # seconds

# Global variables for KNN model
knn_model = None
product_features = None
df = None

# Load products from the database
def load_products_from_db():
    products = list(products_collection.find())
    
    print(f"[DEBUG] Products retrieved: {len(products)}")

    if products:
        print("[DEBUG] Example product:", products[0])
    else:
        print("[ALERT] No products found in MongoDB ❌")

    for product in products:
        product["product_id"] = str(product["_id"])
        
    return products

# Load users from the database for demographic analysis
def load_users_from_db():
    users = list(users_collection.find({}, {
        "_id": 1, 
        "name": 1, 
        "age": 1, 
        "gender": 1, 
        "country": 1
    }))
    
    print(f"[DEBUG] Users retrieved: {len(users)}")
    
    if users:
        # Print example user without sensitive info
        example_user = {k: v for k, v in users[0].items() if k != "password"}
        print("[DEBUG] Example user:", example_user)
    else:
        print("[ALERT] No users found in MongoDB ❌")
        
    return users

# Feature engineering for products
def extract_product_features(df):
    """
    Extract and process features from products data
    """
    # Create a copy to avoid modifying the original
    features_df = df.copy()
    
    # Extract relevant product features
    # Use category, price, rating as features
    if 'category' not in features_df:
        features_df['category'] = 'general'
    
    # Normalize price if available
    if 'price' in features_df:
        scaler = StandardScaler()
        features_df['price_scaled'] = scaler.fit_transform(features_df[['price']])
    else:
        features_df['price_scaled'] = 0
    
    # Use rating if available
    if 'rating' not in features_df:
        features_df['rating'] = 0
    
    # Encode categorical features
    label_encoder = LabelEncoder()
    features_df['category_encoded'] = label_encoder.fit_transform(features_df['category'])
    
    # Create the feature matrix
    X = features_df[['category_encoded', 'price_scaled', 'rating']].values
    return X, features_df

# Build the similarity model for content-based filtering
def build_similarity_model():
    global last_refreshed, products_df, cosine_sim
    current_time = time.time()

    if current_time - last_refreshed > MODEL_REFRESH_INTERVAL:
        products = load_products_from_db()
        df = pd.DataFrame(products)

        # Check if columns exist
        if 'category' not in df.columns:
            df['category'] = 'general'
        if 'description' not in df.columns:
            df['description'] = ''
            
        df["combined"] = df["category"].fillna("") + " " + df["description"].fillna("")

        tfidf = TfidfVectorizer(stop_words="english")
        tfidf_matrix = tfidf.fit_transform(df["combined"])
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        products_df = df
        last_refreshed = current_time
        print("[INFO] Similarity model updated.")
    else:
        print("[INFO] Using cached similarity model.")

    return products_df, cosine_sim

# Train the personalized recommendation model
def train_recommendation_model():
    global df, knn_model, product_features
    
    # Load products and extract features
    products = load_products_from_db()
    df = pd.DataFrame(products)
    
    # Print the columns to verify what data we have
    print(f"[DEBUG] Product columns: {df.columns}")
    print(f"[DEBUG] Number of products loaded: {len(df)}")
    
    # Extract product features
    product_features, features_df = extract_product_features(df)
    
    # Print shape of features to verify
    print(f"[DEBUG] Product features shape: {product_features.shape}")
    
    # Train KNN model on product features
    knn_model = NearestNeighbors(n_neighbors=min(5, len(df)), algorithm='auto')
    knn_model.fit(product_features)
    
    return knn_model, df, product_features

# Get recommendations by category
def get_similar_products_by_category(category, current_id=None, num=10):
    try:
        category_products = products_df[products_df["category"] == category]

        if current_id:
            category_products = category_products[category_products["product_id"] != current_id]

        if category_products.empty:
            print(f"[WARNING] No products found in category: {category}")
            return []

        top_products = category_products.head(num)
        similar_products = top_products.to_dict(orient="records")

        # Add the full image URL to each recommended product
        for product in similar_products:
            product["_id"] = str(product["_id"])
            if "image" in product:
                product["image"] = f"http://localhost:5000{product['image']}"

        return similar_products
    except Exception as e:
        print(f"[ERROR] Error in get_similar_products_by_category: {str(e)}")
        return []

# API endpoint for category-based recommendations
@app.route("/recommendations", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        category = data.get("category")
        current_id = data.get("product_id")

        if not category:
            return jsonify({"error": "category is required"}), 400

        global products_df, cosine_sim
        products_df, cosine_sim = build_similarity_model()

        results = get_similar_products_by_category(category, current_id=current_id)

        return jsonify(convert_objectid_to_str(results))
    except Exception as e:
        print(f"[ERROR] Error in recommendation endpoint: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# API endpoint for personalized recommendations based on user demographics
@app.route("/personalized-recommendations", methods=["POST"])
def personalized_recommend():
    try:
        data = request.get_json()
        print(f"[DEBUG] Received data: {data}")

        # Extract user demographic data
        age = data.get("age")
        gender = data.get("gender")  # Expecting "Male", "Female", or "Other"
        country = data.get("country")

        if not all([age, gender, country]):
            return jsonify({"error": "Missing required demographic fields (age, gender, country)"}), 400

        # Create demographic profile for weighting products
        # This is where we implement the business logic for demographic-based recommendations
        
        # 1. Age-based preferences (example logic)
        age_categories = []
        if age < 18:
            age_categories = ["toys", "games", "education"]
        elif 18 <= age < 30:
            age_categories = ["electronics", "fashion", "sports"]
        elif 30 <= age < 50:
            age_categories = ["home", "electronics", "health"]
        else:
            age_categories = ["health", "home", "books"]
            
        # 2. Gender-based preferences (example logic - customize based on your business)
        gender_weights = {}
        if gender == "Male":
            gender_weights = {"electronics": 1.2, "sports": 1.3, "fashion": 0.9}
        elif gender == "Female":
            gender_weights = {"fashion": 1.2, "beauty": 1.3, "home": 1.1}
        else:  # "Other"
            gender_weights = {"books": 1.1, "electronics": 1.1, "fashion": 1.1}
            
        # Find products matching the preferred categories
        preferred_products = []
        
        # First priority: Match products in age-appropriate categories
        for category in age_categories:
            category_products = list(products_collection.find({"category": {"$regex": category, "$options": "i"}}))
            if category_products:
                # Apply gender weight if applicable
                weight = gender_weights.get(category, 1.0)
                for product in category_products:
                    product["_id"] = str(product["_id"])
                    product["recommendation_score"] = product.get("rating", 3) * weight
                    if "image" in product:
                        product["image"] = f"http://localhost:5000{product['image']}"
                    preferred_products.append(product)
        
        # If we don't have enough products, add more popular products
        if len(preferred_products) < 5:
            popular_products = list(products_collection.find().sort("rating", -1).limit(5))
            for product in popular_products:
                product["_id"] = str(product["_id"])
                product["recommendation_score"] = product.get("rating", 3)
                if "image" in product:
                    product["image"] = f"http://localhost:5000{product['image']}"
                preferred_products.append(product)
        
        # Sort by recommendation score and remove duplicates
        seen_ids = set()
        unique_products = []
        for product in sorted(preferred_products, key=lambda x: x.get("recommendation_score", 0), reverse=True):
            if product["_id"] not in seen_ids:
                seen_ids.add(product["_id"])
                unique_products.append(product)

        # If no products are found, return an empty list (to avoid 'top_products' being undefined)
        if not unique_products:
            return jsonify([])  # Return an empty list if no products are available

        # Convert all products to be JSON serializable
        top_products = convert_objectid_to_str(unique_products)
        
        # Return top 10 or all if less than 10
        top_products = top_products[:10]
        
        return jsonify(top_products)

    except Exception as e:
        print(f"[ERROR] Exception in personalized recommendations: {str(e)}")
        traceback_str = traceback.format_exc()
        print(f"[ERROR] Traceback: {traceback_str}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)