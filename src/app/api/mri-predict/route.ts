import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/dbConfig/dbConfig'
import Report from '@/models/reportModel'
import jwt from 'jsonwebtoken'

connect()

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get('file') as File

    // Forward the request to the actual API
    const response = await fetch('https://resnet-50-jv.onrender.com/predict', {
      method: 'POST',
      body: formData,
    })

    // Get the response data
    const data = await response.json()

    // Save report to database
    let reportId = null
    try {
      // Get userId from token
      const token = request.cookies.get('token')?.value
      if (token && file) {
        const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!)
        const userId = decoded.id

        // Save report
        const report = new Report({
          userId,
          reportType: 'MRI_SCAN',
          fileName: file.name,
          fileSize: file.size,
          reportData: data
        })

        await report.save()
        reportId = report._id.toString()
        console.log('MRI report saved:', reportId)
      }
    } catch (saveError) {
      console.error('Failed to save MRI report:', saveError)
      // Continue anyway - don't fail the prediction
    }

    // Return the response with CORS headers and reportId
    return NextResponse.json({ ...data, reportId }, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to prediction service' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
