import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'UploadThing test endpoint',
    env: {
      hasUploadThingSecret: !!process.env.UPLOADTHING_SECRET,
      hasUploadThingAppId: !!process.env.UPLOADTHING_APP_ID,
    }
  })
} 