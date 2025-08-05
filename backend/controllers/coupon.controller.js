import Coupon from "../models/coupon.model.js";
import { ErrorHandler } from "../utils/errorHandler.js";

export const getCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive:true });
        res.json(coupon || null);
    } catch (error) {
        console.log("Error in getCoupon controller", error);
        next(error);
    }
};

export const validateCoupon = async (req, res, next) => {
    try {
        const {code} = req.body;

        const coupon = await Coupon.findOne({ code:code, userId: req.user._id, isActive:true });
        if(!coupon) {
            throw new ErrorHandler('Coupon not found', 404);
        }

        if(coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            throw new ErrorHandler('Coupon expired', 404);
        }

        res.json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
        });
    } catch (error) {
        console.log("Error in validateCoupon controller", error);
        next(error);
    }
};