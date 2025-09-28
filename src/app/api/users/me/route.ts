import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value || "";
    
    if (!token) {
      return NextResponse.json(
        { error: "No token provided" }, 
        { status: 401 }
      );
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
    
    // Get user from database
    const user = await User.findById(decodedToken.id).select("-password");
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User data retrieved successfully",
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        height: user.height,
        weight: user.weight,
        familyHistory: user.familyHistory,
      }
    });

  } catch (error: unknown) {
    console.error("Get user error:", error);

    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
