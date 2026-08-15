import connect from "@/lib/db";
import { deleteFile, uploadFile } from "@/lib/upload";
import sendToken from "@/lib/userToken";
import user from "@/models/user";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const validationMessage = (error) => {
    return (
        Object.values(error.errors || {})[0]?.message ||
        "Please enter valid information"
    );
};

export const createUser = async (req) => {
    try {
        await connect();

        const {
            firstname,
            lastname,
            email,
            password,
            contactnumber,
            country,
        } = await req.json();

        if (
            !firstname?.trim() ||
            !lastname?.trim() ||
            !email?.trim() ||
            !password
        ) {
            return NextResponse.json({
                success: false,
                message: "Please enter all required information",
            }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await user.exists({
            email: normalizedEmail,
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "An account with this email already exists",
            }, { status: 409 });
        }

        const User = await user.create({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            email: normalizedEmail,
            password,
            contactnumber: contactnumber?.trim() || "",
            country: country?.trim() || "",
            role: "user",
        });

        return sendToken(User, 201);
    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: "An account with this email already exists",
            }, { status: 409 });
        }

        if (error.name === "ValidationError") {
            return NextResponse.json({
                success: false,
                message: validationMessage(error),
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const login = async (req) => {
    try {
        await connect();

        const {
            email,
            password: enteredPassword,
        } = await req.json();

        if (!email?.trim() || !enteredPassword) {
            return NextResponse.json({
                success: false,
                message: "Please enter email and password",
            }, { status: 400 });
        }

        const User = await user
            .findOne({
                email: email.trim().toLowerCase(),
            })
            .select("+password");

        if (!User) {
            return NextResponse.json({
                success: false,
                message: "Please enter a valid email and password",
            }, { status: 401 });
        }

        const passwordAuthenticated = await bcrypt.compare(
            enteredPassword,
            User.password,
        );

        if (!passwordAuthenticated) {
            return NextResponse.json({
                success: false,
                message: "Please enter a valid email and password",
            }, { status: 401 });
        }

        return sendToken(User, 200);
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const logOut = async () => {
    try {
        const response = NextResponse.json({
            success: true,
            message: "User is logged out",
        }, { status: 200 });

        response.cookies.delete("token");

        return response;
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const getAllUser = async () => {
    try {
        await connect();

        const Users = await user
            .find()
            .select("-password")
            .sort({
                createdAt: -1,
            })
            .lean();

        return NextResponse.json({
            success: true,
            message: "Users are found",
            users: Users,
        }, { status: 200 });
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const getUser = async (req, id) => {
    try {
        await connect();

        if (!isValidId(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid user ID",
            }, { status: 400 });
        }

        const User = await user
            .findById(id)
            .select("-password")
            .lean();

        if (!User) {
            return NextResponse.json({
                success: false,
                message: "User is not found",
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "User is found",
            user: User,
        }, { status: 200 });
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const updateUser = async (req, id) => {
    try {
        await connect();

        if (!isValidId(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid user ID",
            }, { status: 400 });
        }

        const {
            firstname,
            lastname,
            email,
            contactnumber,
            country,
        } = await req.json();

        if (
            !firstname?.trim() ||
            !lastname?.trim() ||
            !email?.trim()
        ) {
            return NextResponse.json({
                success: false,
                message: "First name, last name and email are required",
            }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingEmail = await user.exists({
            email: normalizedEmail,
            _id: {
                $ne: id,
            },
        });

        if (existingEmail) {
            return NextResponse.json({
                success: false,
                message: "Another account already uses this email",
            }, { status: 409 });
        }

        const User = await user
            .findByIdAndUpdate(
                id,
                {
                    firstname: firstname.trim(),
                    lastname: lastname.trim(),
                    email: normalizedEmail,
                    contactnumber: contactnumber?.trim() || "",
                    country: country?.trim() || "",
                },
                {
                    new: true,
                    runValidators: true,
                },
            )
            .select("-password");

        if (!User) {
            return NextResponse.json({
                success: false,
                message: "User is not found",
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "User is updated",
            user: User,
        }, { status: 200 });
    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: "Another account already uses this email",
            }, { status: 409 });
        }

        if (error.name === "ValidationError") {
            return NextResponse.json({
                success: false,
                message: validationMessage(error),
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const updateUserRole = async (
    req,
    id,
    loggedInUserId,
) => {
    try {
        await connect();

        if (!isValidId(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid user ID",
            }, { status: 400 });
        }

        const { role } = await req.json();

        const normalizedRole = String(role || "")
            .trim()
            .toLowerCase();

        const allowedRoles = [
            "user",
            "admin",
        ];

        if (!allowedRoles.includes(normalizedRole)) {
            return NextResponse.json({
                success: false,
                message: "Please select a valid user role",
            }, { status: 400 });
        }

        if (
            String(id) ===
            String(loggedInUserId) &&
            normalizedRole !== "admin"
        ) {
            return NextResponse.json({
                success: false,
                message: "You cannot remove your own administrator role",
            }, { status: 400 });
        }

        const User = await user
            .findByIdAndUpdate(
                id,
                {
                    role: normalizedRole,
                },
                {
                    new: true,
                    runValidators: true,
                },
            )
            .select("-password");

        if (!User) {
            return NextResponse.json({
                success: false,
                message: "User is not found",
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "User role is updated",
            user: User,
        }, { status: 200 });
    } catch (error) {
        console.log(error);

        if (error.name === "ValidationError") {
            return NextResponse.json({
                success: false,
                message: validationMessage(error),
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const deleteUser = async (
    id,
    clearSession = false,
) => {
    try {
        await connect();

        if (!isValidId(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid user ID",
            }, { status: 400 });
        }

        const User = await user.findById(id);

        if (!User) {
            return NextResponse.json({
                success: false,
                message: "User is not found",
            }, { status: 404 });
        }

        const profileImage =
            User.profileimage?.public_id;

        if (profileImage) {
            await deleteFile(
                profileImage,
                "image",
            );
        }

        await User.deleteOne();

        const response = NextResponse.json({
            success: true,
            message: "User is deleted",
        }, { status: 200 });

        if (clearSession) {
            response.cookies.delete("token");
        }

        return response;
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const updatePassword = async (
    req,
    id,
) => {
    try {
        await connect();

        if (!isValidId(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid user ID",
            }, { status: 400 });
        }

        const {
            currentPassword,
            newPassword,
            confirmPassword,
            verifyOnly,
        } = await req.json();

        if (!currentPassword) {
            return NextResponse.json({
                success: false,
                message: "Please enter your current password",
            }, { status: 400 });
        }

        const User = await user
            .findById(id)
            .select("+password");

        if (!User) {
            return NextResponse.json({
                success: false,
                message: "Please log in",
            }, { status: 401 });
        }

        const passwordCorrect =
            await bcrypt.compare(
                currentPassword,
                User.password,
            );

        if (!passwordCorrect) {
            return NextResponse.json({
                success: false,
                message: "Your current password is incorrect",
            }, { status: 401 });
        }

        if (verifyOnly === true) {
            return NextResponse.json({
                success: true,
                message: "Current password is verified",
            }, { status: 200 });
        }

        if (!newPassword || !confirmPassword) {
            return NextResponse.json({
                success: false,
                message: "Please enter and confirm your new password",
            }, { status: 400 });
        }

        if (currentPassword === newPassword) {
            return NextResponse.json({
                success: false,
                message: "New password must be different from current password",
            }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({
                success: false,
                message: "New password and confirm password must match",
            }, { status: 400 });
        }

        User.password = newPassword;

        await User.save();

        return NextResponse.json({
            success: true,
            message: "Password is updated",
        }, { status: 200 });
    } catch (error) {
        console.log(error);

        if (error.name === "ValidationError") {
            return NextResponse.json({
                success: false,
                message: validationMessage(error),
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};

export const profileImage = async (
    req,
    id,
) => {
    let uploadedPublicId = "";

    try {
        await connect();

        if (!isValidId(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid user ID",
            }, { status: 400 });
        }

        const formData = await req.formData();
        const file = formData.get("image");

        if (
            !file ||
            typeof file === "string" ||
            file.size === 0
        ) {
            return NextResponse.json({
                success: false,
                message: "Please select an image",
            }, { status: 400 });
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json({
                success: false,
                message: "Only image files are allowed",
            }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                message: "Image size cannot be greater than 5MB",
            }, { status: 400 });
        }

        const User = await user.findById(id);

        if (!User) {
            return NextResponse.json({
                success: false,
                message: "User is not found",
            }, { status: 404 });
        }

        const oldPublicId =
            User.profileimage?.public_id;

        const uploadedImage = await uploadFile(
            file,
            `Studiesforge/user/profileImages/${User._id}`,
            "image",
        );

        uploadedPublicId =
            uploadedImage.public_id;

        User.profileimage = {
            public_id:
                uploadedImage.public_id,
            url:
                uploadedImage.secure_url,
        };

        await User.save();

        uploadedPublicId = "";

        if (
            oldPublicId &&
            oldPublicId !==
            uploadedImage.public_id
        ) {
            try {
                await deleteFile(
                    oldPublicId,
                    "image",
                );
            } catch (deleteError) {
                console.log(
                    "Old profile image could not be deleted:",
                    deleteError,
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: "Profile image is updated",
            user: User,
        }, { status: 200 });
    } catch (error) {
        console.log(error);

        if (uploadedPublicId) {
            try {
                await deleteFile(
                    uploadedPublicId,
                    "image",
                );
            } catch (cleanupError) {
                console.log(
                    "Uploaded image cleanup failed:",
                    cleanupError,
                );
            }
        }

        return NextResponse.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 });
    }
};