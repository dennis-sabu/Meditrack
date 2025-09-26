import { env } from "@/env";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    region:"auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
    },
});

interface UploadFileParams {
    fileBuffer: Buffer;
    fileName: string;
    fileType: string;
}

export async function uploadFile({ fileBuffer, fileName, fileType }: UploadFileParams): Promise<void> {
    const uploadParams = {
        Bucket: env.CLOUDFLARE_R2_BUCKET_NAME as string,
        Key: fileName,
        Body: fileBuffer,
        ContentType: fileType,
    };

    await s3.send(new PutObjectCommand(uploadParams));
}