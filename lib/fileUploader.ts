
import { BASE_URL } from "@/constants";
import axios from "axios";

export const uploadFileToS3 = async (
    file: File,
    prefix: string,
    onProgress?: (progress: { percentage: number; uploadedSize: string }) => void
): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("prefix", prefix);

        // Ensure full URL for API request
        const apiUrl = `${BASE_URL}/api/upload`;

        const response = await axios.post(apiUrl, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    const uploadedSize = `${(progressEvent.loaded / 1024 / 1024).toFixed(2)} MB`;
                    onProgress?.({ percentage, uploadedSize });
                }
            },
        });

        return response.data.filePath;
    } catch (error) {
        console.error("Upload failed:", error);
        return null;
    }
};
