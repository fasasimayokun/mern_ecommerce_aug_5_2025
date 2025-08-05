import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/errorHandler.js";
import User from "../models/user.model.js";


export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken) {
            throw new ErrorHandler('UnAuthorized - No access token provided', 401);
        };

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select("-password");
            if(!user) {
                throw new ErrorHandler('User not found', 404);
            };

            req.user = user;
        } catch (error) {
            if(error.name === "TokenExpiredError") {
                throw new ErrorHandler('UnAuthorized - Access token expired');
            }
            throw error;
        }        

        next();
    } catch (error) {
        console.log("Error in protectRoutes", error.message);
        next(error);
    }
};
export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ErrorHandler('Access denied - Admin only', 403));
  }
};