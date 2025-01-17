import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  region: process.env.AWS_REGION || "us-east-1",
});

export const convertToWebp = async (file: Express.Multer.File) => {
  if (file.mimetype !== "image/webp") {
    file.buffer = await sharp(file.buffer).toFormat("webp").toBuffer();
    file.mimetype = "image/webp";
    file.originalname = `${file.originalname.split(".")[0]}.webp`;
    return file;
  }
  return file;
};

export const uploadFile = async (file: Express.Multer.File, clubId: string) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME || "",
    Key: `clubs/${clubId}/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  const uploadResult = {
    Location: `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
  };

  return uploadResult.Location;
};
