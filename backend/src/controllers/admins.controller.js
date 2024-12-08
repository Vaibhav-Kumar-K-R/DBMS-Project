import Admin from "../models/admin.model.js";
import Manager from "../models/manager.model.js";
import Warehouse from "../models/warehouse.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { uploadImage } from "../config/cloudinary.js";

const signInAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        message: "Admin doesn't exist. Please Sign-up",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Something went wrong",
      });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("admin_auth_token", token, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      adminId: admin._id,
      message: "Admin Signed In successfully",
    });
  } catch (error) {
    next(error);
  }
};

const createManagerProfile = async (req, res, next) => {
  try {
    let manager = await Manager.findOne({ email: req.body.email });

    if (manager) {
      return res.status(400).json({
        message: "Manager already exists",
      });
    }

    const profileImage = req.file;
    let profileImgDetails = null;

    if (profileImage) {
      profileImgDetails = await uploadImage(profileImage);
    }

    manager = await Manager.create(
      profileImgDetails
        ? {
            ...req.body,
            profile_img: {
              profile_img_url: profileImgDetails.secure_url,
              public_id: profileImgDetails.public_id,
            },
          }
        : req.body,
    );

    res.status(201).json({
      manager_id: manager._id,
      message: "Manager profile created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const createWarehouseProfile = async (req, res, next) => {
  try {
    let warehouse = await Warehouse.findOne({ email: req.body.email });

    if (warehouse) {
      return res.status(400).json({
        message: "Warehouse with given email already exists!!",
      });
    }
    // Validate that the manager_id exists as an ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.body.manager_id)) {
      return res.status(400).json({ error: "Invalid ObjectId for manager_id" });
    }
    req.body.manager_id = new mongoose.Types.ObjectId(req.body.manager_id);
    warehouse = await Warehouse.create(req.body);

    return res.status(201).json({
      warehouse_id: warehouse._id,
      message: "Warehouse profile created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getWarehouseList = async (req, res, next) => {
  try {
    let warehouseList = await Warehouse.find({}).select(
      "-createdAt -updatedAt -__v -_id",
    );

    if (warehouseList.length == 0) {
      return res.status(400).json({
        message: "No warehouses found !!",
      });
    }

    return res.status(201).json({
      warehouses: warehouseList,
      total_count: warehouseList.length,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  signInAdmin,
  createManagerProfile,
  createWarehouseProfile,
  getWarehouseList,
};
