import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import HelpDeskMessage from "@/models/helpDeskModel";

connect();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject, message, category } = body;

        if (!name || !message) {
            return NextResponse.json(
                { success: false, error: "Name and message are required." },
                { status: 400 }
            );
        }

        if (message.trim().length < 10) {
            return NextResponse.json(
                { success: false, error: "Message must be at least 10 characters." },
                { status: 400 }
            );
        }

        const helpDeskMsg = new HelpDeskMessage({
            name: name.trim(),
            email: email?.trim() || undefined,
            subject: subject?.trim() || undefined,
            message: message.trim(),
            category: category || "feedback",
        });

        await helpDeskMsg.save();

        return NextResponse.json(
            {
                success: true,
                message: "Your message has been received. We'll get back to you soon!",
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error("Help desk error:", error);
        const errMsg =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}
