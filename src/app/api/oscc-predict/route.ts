import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/dbConfig/dbConfig'
import Report from '@/models/reportModel'
import jwt from 'jsonwebtoken'

// Extend Vercel function timeout to 60s (handles HuggingFace cold starts)
export const maxDuration = 60

connect()

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (!process.env.OSCC_FASTAPI) {
            console.error('OSCC_FASTAPI env variable is not set')
            return NextResponse.json({ error: 'OSCC service URL not configured' }, { status: 500 })
        }

        // Rebuild FormData properly (avoids Content-Type boundary issues on Vercel)
        const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type })
        const forwardForm = new FormData()
        forwardForm.append('file', fileBlob, file.name)

        // Forward to HuggingFace OSCC FastAPI
        console.log('Calling OSCC FastAPI:', process.env.OSCC_FASTAPI)
        const response = await fetch(process.env.OSCC_FASTAPI, {
            method: 'POST',
            body: forwardForm,
        })

        if (!response.ok) {
            const errText = await response.text()
            console.error('OSCC FastAPI error:', response.status, errText)
            return NextResponse.json({ error: `OSCC service error: ${response.status}` }, { status: 502 })
        }

        const data = await response.json()
        console.log(data)

        // Save report to database
        let reportId = null
        try {
            const token = request.cookies.get('token')?.value
            if (token && file) {
                const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string }
                const userId = decoded.id

                const report = new Report({
                    userId,
                    reportType: 'OSCC_SCAN',
                    fileName: file.name,
                    fileSize: file.size,
                    reportData: data,
                })

                await report.save()
                reportId = report._id.toString()
                console.log('OSCC report saved:', reportId)
            }
        } catch (saveError) {
            console.error('Failed to save OSCC report:', saveError)
        }

        return NextResponse.json({ ...data, reportId }, {
            status: response.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        })
    } catch (error) {
        console.error('OSCC proxy error:', error)
        return NextResponse.json(
            { error: 'Failed to connect to OSCC prediction service' },
            {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
            }
        )
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
