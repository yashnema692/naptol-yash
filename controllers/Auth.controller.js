const Model = require("../models/user.model");
// const { registerSchema, registerUserSchema, registerVendorSchema, loginSchema, loginUserSchema, verifyOtpSchema, onboardInfluencerSchema, createUserSchema } = require('../Validations/auth_validation_schema')
const createError = require("http-errors");
var moment = require("moment");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../Helpers/jwt_helper");

module.exports = {

  signUp: async (req, res, next) => {
    try {
      const result = req.body;
      const data = {
        name: result.name,
        email: result.email,
        password: result.password,
        confirmPassword: result.confirmPassword,
        role: 'User'
      };
      const dataExists = await Model.findOne({
        $or: [{ email: data.email }],
        is_inactive: false,
      }).lean();
      if (dataExists) {
        throw createError.Conflict(
          `User already exists with email`
        );
      }
      const newData = new Model(data);
      const resultData = await newData.save();
      const accessToken = await signAccessToken(resultData._id);
      const refreshToken = await signRefreshToken(resultData._id);
      res.send({
        success: true,
        msg: "Registration Successful",
        accessToken,
        refreshToken,
        user: {
          id: resultData._id,
          name: resultData.name,
          email: resultData.email,
          role: resultData.role,
        },
      });
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Invalid Username/Password"));
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const result = req.body;
      let user =
        (await Model.findOne({ email: result.email })) ||
        (await Model.findOne({ mobile: result.email }));
      if (!user) {
        throw createError.NotFound("User not registered");
      }

      const isMatch = await user.isValidPassword(result.password);
      if (!isMatch)
        throw createError.NotAcceptable("Username/password not valid");
      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);

      res.send({
        success: true,
        msg: "Login Successful",
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          // mobile: user.mobile,
          role: user.role,
          // topUser: user.topUser,
        },
      });
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Invalid Username/Password"));
      next(error);
    }
  },
  refreshToken: async (req, res, next) => {
    try {
      // refresh access token with refresh token
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);
      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);

      res.send({ accessToken, refreshToken: refToken });
      return;
    } catch (err) {
      next(err);
    }
  },
  profile: async (req, res, next) => {
    try {
      if (!req.user) throw createError.Unauthorized("User not found");
      data = {
        success: true,
        msg: "Profile Fetched",
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      };
      data = JSON.parse(JSON.stringify(data));
      delete data.user.password;
      res.send(data);
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Invalid Username/Otp"));
      next(error);
    }
  },
};
