db.products.find({})

db.products.find({"category": "Apparel"})

db.products.find({"variants.color": "White"})
