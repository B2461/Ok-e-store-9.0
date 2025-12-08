
const CLOUD_NAME = 'de2eehtiy';
const UPLOAD_PRESET = 'ok_estore_preset'; // Important: Create this as an Unsigned preset in Cloudinary settings
const API_KEY = '324475644837729';

/**
 * Uploads a file to Cloudinary.
 * Uses 'auto' resource type to handle images and videos.
 * @param file The file to upload
 * @param onProgress Optional callback for upload progress
 * @returns Promise resolving to the secure download URL
 */
export const uploadToCloudinary = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('api_key', API_KEY);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                const percentComplete = (e.loaded / e.total) * 100;
                onProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve(response.secure_url);
            } else {
                console.error('Cloudinary error:', xhr.responseText);
                reject(new Error(`Cloudinary upload failed: ${xhr.status} ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Cloudinary upload network error'));
        };

        xhr.send(formData);
    });
};
