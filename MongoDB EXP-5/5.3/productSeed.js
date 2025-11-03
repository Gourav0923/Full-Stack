db.products.insertMany([
  {
    "name": "Classic Crewneck T-Shirt",
    "price": 25.00,
    "category": "Apparel",
    "description": "A comfortable 100% cotton t-shirt.",
    "variants": [
      {
        "sku": "TS-C-S",
        "color": "Charcoal",
        "size": "Small",
        "stock": 150,
        "images": ["url_charcoal_s.jpg"],
        "variant_price_modifier": 0
      },
      {
        "sku": "TS-C-L",
        "color": "Charcoal",
        "size": "Large",
        "stock": 80,
        "images": ["url_charcoal_l.jpg"],
        "variant_price_modifier": 2.50 // Larger size is slightly more
      },
      {
        "sku": "TS-W-M",
        "color": "White",
        "size": "Medium",
        "stock": 200,
        "images": ["url_white_m.jpg"],
        "variant_price_modifier": 0
      }
    ]
  },
  {
    "name": "Noise-Cancelling Headphones",
    "price": 199.99,
    "category": "Electronics",
    "description": "Premium sound quality and active noise cancellation.",
    "variants": [
      {
        "sku": "HP-B",
        "color": "Black",
        "size": "N/A",
        "stock": 50,
        "images": ["url_hp_black.jpg"],
        "variant_price_modifier": 0
      },
      {
        "sku": "HP-S",
        "color": "Silver",
        "size": "N/A",
        "stock": 30,
        "images": ["url_hp_silver.jpg"],
        "variant_price_modifier": 5.00 // Premium color
      }
    ]
  }
]);
