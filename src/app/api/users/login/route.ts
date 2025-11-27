import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;

    // Validate input fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" }, 
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" }, 
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "User does not exist" }, 
        { status: 400 }
      );
    }

    // Validate password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" }, 
        { status: 400 }
      );
    }

    // Generate token
    const tokenData = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    // Send cookie and response
    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      }
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;

  } catch (error: unknown) {
    console.error("Login error:", error);
    
    // Handle specific MongoDB/Mongoose errors
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (error instanceof Error && error.name === "MongoNetworkError") {
      return NextResponse.json(
        { error: "Database connection failed. Please try again later." }, 
        { status: 503 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: "Internal server error. Please try again later." }, 
      { status: 500 }
    );
  }
}
