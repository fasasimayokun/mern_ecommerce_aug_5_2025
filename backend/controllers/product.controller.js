import Product from "../models/product.model.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find({}); // find all products
        res.status(200).json({ products });
    } catch (error) {
        console.log("Error in getAllProducts controller ", error.message);
        next(error);
    }
};

export const getFeaturedProducts = async (req, res, next) => {
    try {
        let featuredProducts = await redis.get('featured_products');
        if (featuredProducts) {
            return res.status(200).json(JSON.parse(featuredProducts)); //redis returns a string so we use json.parse to covert it to json
        }

        // if not in redis, fetch from mongodb
        featuredProducts = await Product.find({ isFeatured:true }).lean(); // lean() returns javascript obj instead of mongodb obj improves performances
        if(!featuredProducts) {
            throw new ErrorHandler('No featured products found', 404);
        }

        // store in redis for future quick access
        await redis.set("featured_products", JSON.stringify(featuredProducts));

        res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts controller ", error.message);
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
  try {
    const {name, description, price, image, category} = req.body;

    let cloudinaryResponse = null;

    if(image) {
        cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"});
    }

    const product = await Product.create({
        name,
        description,
        price,
        image: cloudinaryResponse?.secure_url ? cloudinaryResponse?.secure_url : "",
        category
    });

    res.status(201).json({product, message: "Product created successfully"});
  } catch (error) {
    console.log("Error in createProduct controller ", error.message);
    next(error); 
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if(!product) {
        throw new ErrorHandler('Product not found', 404);
    }

    if(product.image) {
        const publicId = product.image.split("/").pop().split('.')[0];
        try {
            await cloudinary.uploader.destroy(`products/${publicId}`);
            console.log("Deleted image from Cloudinary");
        } catch (error) {
            console.log("Error deleting image from cloudinary", error);   
        }
    };

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller ", error.message);
    next(error); 
  }
};

export const getRecommendedProducts = async (req, res, next) => {
  try {
    const products = await Product.aggregate([
        {
            $sample: {size:3}
        },
        {
            $project: {
                _id:1,
                name:1,
                description:1,
                image:1,
                price:1
            }
        }
    ]);

    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller ", error.message);
    next(error); 
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const category = req.params.category;

    const products = await Product.find({ category });

    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getProductsByCategory controller ", error.message);
    next(error); 
  }
};

export const toggleFeaturedProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if(product) {
        product.isFeatured = !product.isFeatured;
        const updatedProduct = await product.save();
        // update the redis
        await updateFeaturedProductsCache();
        res.status(200).json(updatedProduct);
    } else {
        throw new ErrorHandler('Product not found', 404);
    }

  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller ", error.message);
    next(error); 
  }
};

async function updateFeaturedProductsCache() {
    try {
        // lean() returns javascript obj instead of mongodb obj improves performances
        const featuredProducts = await Product.find({ isFeatured: true}).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error in updateFeaturedProductsCache controller ", error.message);
        next(error);
    }
}