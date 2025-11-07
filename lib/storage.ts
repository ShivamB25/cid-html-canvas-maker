export interface StoredImage {
  id: string
  shareId: string
  blobUrl: string
  filename: string
  mimeType: string
  fileSize: number
  uploadedAt: number
  views: number
}

interface SaveImageInput {
  id: string
  shareId: string
  blobUrl: string
  filename: string
  mimeType: string
  fileSize: number
}

class InMemoryStorage {
  private images = new Map<string, StoredImage>()

  saveImage(payload: SaveImageInput): StoredImage {
    const record: StoredImage = {
      ...payload,
      uploadedAt: Date.now(),
      views: 0
    }
    this.images.set(payload.shareId, record)
    return record
  }

  getImage(id: string): StoredImage | undefined {
    return this.images.get(id)
  }

  incrementViews(id: string): void {
    const record = this.images.get(id)
    if (record) {
      record.views += 1
      this.images.set(id, record)
    }
  }
}

export const storage = new InMemoryStorage()
