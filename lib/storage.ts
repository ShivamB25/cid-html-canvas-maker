// In-memory storage for image metadata
// Note: This will reset when the server restarts

export interface ImageData {
  id: string
  shareId: string
  blobUrl: string
  filename: string
  mimeType: string
  fileSize: number
  uploadedAt: Date
  views: number
}

// Simple in-memory Map to store images
const imageStore = new Map<string, ImageData>()

export const storage = {
  // Save image metadata
  saveImage(data: Omit<ImageData, 'uploadedAt' | 'views'>): ImageData {
    const image: ImageData = {
      ...data,
      uploadedAt: new Date(),
      views: 0,
    }
    imageStore.set(data.shareId, image)
    return image
  },

  // Get image by shareId
  getImage(shareId: string): ImageData | null {
    return imageStore.get(shareId) || null
  },

  // Increment view count
  incrementViews(shareId: string): void {
    const image = imageStore.get(shareId)
    if (image) {
      image.views++
      imageStore.set(shareId, image)
    }
  },

  // Get all images (optional - for admin/debug)
  getAllImages(): ImageData[] {
    return Array.from(imageStore.values())
  },

  // Delete image (optional)
  deleteImage(shareId: string): boolean {
    return imageStore.delete(shareId)
  },

  // Get total count
  getCount(): number {
    return imageStore.size
  }
}
