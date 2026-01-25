import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Report from "@/models/reportModel";
import jwt from "jsonwebtoken";

connect();

// Get single report by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params;

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
    const userId = decoded.id;

    // Fetch report
    const report = await Report.findOne({
      _id: id,
      userId  // Ensure user can only access their own reports
    }).lean();

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Use type assertion for basic property access since lean() returns POJO
    const reportData = report as Record<string, unknown>;
    const reportContent = reportData.reportData as Record<string, unknown> | undefined;

    console.log(`[API] Fetched report ${id}:`, {
      type: reportData.reportType,
      hasData: !!reportContent,
      keys: reportContent ? Object.keys(reportContent) : []
    });

    return NextResponse.json({
      success: true,
      report
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Delete report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params;

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
    const userId = decoded.id;

    // Delete report
    const result = await Report.deleteOne({
      _id: id,
      userId  // Ensure user can only delete their own reports
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully"
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
