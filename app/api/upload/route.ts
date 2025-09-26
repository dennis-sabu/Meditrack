import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { s3 } from "@/lib/s3";
import { promisify } from "util";
import { env } from "@/env";

// Configure multer (temporary storage)
const upload = multer({ dest: "/tmp" });
const uploadMiddleware = promisify(upload.single("file"));

// Function to generate a unique file name
const generateShortFileName = (originalName: string, prefix: string) => {
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  return `${prefix}-${timestamp}${ext}`;
};

// ✅ Export a named function for POST requests
export async function POST(req: NextRequest) {
  try {
    // Ensure it's a multipart request
    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    // Process form data
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const prefix = formData.get("prefix") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename
    const fileName = generateShortFileName("uploadedFile", prefix || "UP");

    // Upload file to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // const fileUrl = `https://${process.env.CLOUDFLARE_R2_BUCKET_NAME}.r2.cloudflarestorage.com/${fileName}`;

    const fileUrl = `https://files.hardhatcloudtech.com/${fileName}`;
    
    return NextResponse.json({ filePath: fileUrl }, { status: 200 });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
