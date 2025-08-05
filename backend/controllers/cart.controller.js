import { ErrorHandler } from "../utils/errorHandler.js";
import Product from "../models/product.model.js";


export const getCartProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ _id: {$in: req.user.cartItems }});

        // add quantity for eact product
        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItem => cartItem.id === product.id);
            return {...product.toJSON(), quantity: item.quantity}
        });

        res.json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts controller", error);
        next(error);
    }
};

export const addToCart = async (req, res, next) => {
    try {
        const {productId} = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(item => item.id === productId);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push(productId)
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart controller", error);
        next(error);
    }
};

export const removeAllFromCart = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        if(!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in removeAllFromCart controller", error);
        next(error);
    }
};

export const updateQuantity = async (req, res, next) => {
    try {
        const { id:productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find((item) => item.id === productId);

        if(existingItem) {
            if(quantity === 0) {
                user.cartItems = user.cartItems.filter((item) => item.id !== productId);
                await user.save();
                return res.json(user.cartItems);
            } 

            existingItem.quantity = quantity;
            await user.save();
            res.json(user.cartItems);
        } else {
            throw new ErrorHandler('Product not found', 404);
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error);
        next(error);
    }
};
