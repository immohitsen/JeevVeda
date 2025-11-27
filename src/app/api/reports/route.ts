import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Report from "@/models/reportModel";
import jwt from "jsonwebtoken";

connect();

// Get all reports for a user
export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token and get userId
    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const userId = decoded.id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = { userId };
    if (reportType && reportType !== "ALL") {
      query.reportType = reportType;
    }

    // Fetch reports with pagination
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Report.countDocuments(query);

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReports: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Create a new report
export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token and get userId
    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const userId = decoded.id;

    // Get request body
    const body = await request.json();
    const { reportType, fileName, fileSize, reportData } = body;

    // Validate required fields
    if (!reportType || !reportData) {
      return NextResponse.json(
        { error: "reportType and reportData are required" },
        { status: 400 }
      );
    }

    // Create report
    const report = new Report({
      userId,
      reportType,
      fileName,
      fileSize,
      reportData
    });

    await report.save();

    return NextResponse.json({
      success: true,
      reportId: report._id,
      message: "Report saved successfully"
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
