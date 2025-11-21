// Cloudinary configuration
// Get these values from your Cloudinary dashboard: https://cloudinary.com/console
// You need to create an upload preset (unsigned) for client-side uploads

export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
};

// Check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  return !!(cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset);
};

// Cloudinary upload URL
export const CLOUDINARY_UPLOAD_URL = cloudinaryConfig.cloudName 
  ? `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`
  : null;

// Helper function to upload image to Cloudinary
export const uploadImageToCloudinary = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary chưa được cấu hình. Vui lòng kiểm tra file .env và tham khảo CLOUDINARY_SETUP.md');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (max 10MB for Cloudinary free tier)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  
  // Optional: Add folder to organize images
  formData.append('folder', 'vinfast/contracts');

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error('Upload thành công nhưng không nhận được URL ảnh');
    }
    
    return data.secure_url; // Return the secure URL of the uploaded image
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Lỗi khi upload ảnh lên Cloudinary. Vui lòng thử lại.');
  }
};

// Helper function to upload file (image or PDF) to Cloudinary
// For PDF files, use /raw/upload/ endpoint as per Cloudinary documentation:
// https://support.cloudinary.com/hc/en-us/articles/360016480179
export const uploadFileToCloudinary = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary chưa được cấu hình. Vui lòng kiểm tra file .env và tham khảo CLOUDINARY_SETUP.md');
  }

  // Validate file type (image or PDF)
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/');
  
  if (!isImage && !isPDF) {
    throw new Error('File phải là ảnh hoặc PDF');
  }

  // Validate file size (max 10MB for Cloudinary free tier)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Kích thước file không được vượt quá 10MB');
  }

  // Use /raw/upload/ endpoint for PDF files, /image/upload/ for images
  // This is important for PDF delivery as per Cloudinary documentation
  const uploadUrl = cloudinaryConfig.cloudName 
    ? (isPDF 
        ? `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/raw/upload`
        : `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`)
    : null;

  if (!uploadUrl) {
    throw new Error('Cloudinary chưa được cấu hình');
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  
  // Optional: Add folder to organize files
  formData.append('folder', 'vinfast/contracts');

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error('Upload thành công nhưng không nhận được URL file');
    }
    
    return data.secure_url; // Return the secure URL of the uploaded file
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Lỗi khi upload file lên Cloudinary. Vui lòng thử lại.');
  }
};

// Helper function to delete image from Cloudinary (requires server-side implementation)
// Note: This requires API secret, so it should be done server-side
export const deleteImageFromCloudinary = async (imageUrl) => {
  // Extract public_id from URL
  // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
  const urlParts = imageUrl.split('/upload/');
  if (urlParts.length < 2) {
    throw new Error('Invalid Cloudinary URL');
  }
  
  const publicId = urlParts[1].split('.')[0]; // Remove file extension
  
  // Note: Deletion requires server-side API call with API secret
  // For now, we'll just return the public_id
  return publicId;
};

