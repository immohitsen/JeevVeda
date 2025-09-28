import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const {
      fullName,
      email,
      password,
      gender,
      dateOfBirth,
      height,
      weight,
      familyHistory,
    } = reqBody;

    console.log(reqBody);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      gender,
      dateOfBirth,
      height,
      weight,
      familyHistory,
    });

    const savedUser = await newUser.save();
    console.log("User registered:", savedUser);

    return NextResponse.json({
      message: "User registered successfully",
      success: true,
      savedUser
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
