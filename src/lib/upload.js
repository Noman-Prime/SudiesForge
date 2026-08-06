import "server-only"
import cloudinary from "./cloudinary"

export const uploadFile = async (file, folder, type) => {
    const buffer = Buffer.from(await file.arrayBuffer())
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder, resource_type: type }, (error, result) => {
            if (error) {
                return reject(error)
            }
            return resolve(result)
        }).end(buffer)
    })
}

export const deleteFile = async (publicId, type) => {
    return cloudinary.uploader.destroy(publicId, {
        resource_type: type,
        invalidate: true
    })
}