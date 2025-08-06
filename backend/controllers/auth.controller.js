import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    return {accessToken, refreshToken};
};

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7*24*60*60);
};

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent xss attacks, cross site scripting attack
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
        maxAge: 15 * 60 * 1000, // 15mins in miliseconds
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // prevent xss attacks, cross site scripting attack
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7days in miliseconds
    });
};

export const signup = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new ErrorHandler("User already exists", 400);
        };

        const user = await User.create({
            name,
            email,
            password
        });
        
        // generatetokens
        const {accessToken, refreshToken} = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            message: "User created successfully"
        });
    } catch (error) {
        console.log("Error in signup controller ", error.message);
        next(error)
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password} = req.body;

        const user = await User.findOne({ email });
        if(user && (await user.comparePassword(password))) {
            const {accessToken, refreshToken} = generateTokens(user._id);
            
            // store refreshtoken to redis
            await storeRefreshToken(user._id, refreshToken)
            setCookies(res, accessToken, refreshToken);

            res.status(200).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                message: "Loggin successfully"
            });
        } else {
            throw new ErrorHandler('Invalid email or password', 400);
        }

    } catch (error) {
        console.log("Error in login controller ", error.message);
        next(error)        
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        };
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({ message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller ", error.message);
        next(error);
    }
};


export const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            throw new ErrorHandler('No refresh token Provided', 401);
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if(!decoded) {
            throw new ErrorHandler('Invalid refresh token', 401);
        };

        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

        if(storedToken !== refreshToken ) {
            throw new ErrorHandler("referesh token doesn't match", 401);
        };

        const {accessToken} = generateTokens(decoded.userId);
        
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        });

        res.status(200).json({ message: "Token refreshed successfully"});
    } catch (error) {
        console.log("Error in refreshToken controller ", error.message);
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Error in getProfile controller ", error.message);
        next(error);
    }
};