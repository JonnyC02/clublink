import { convertToWebp, uploadFile } from "../../src/utils/file";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

jest.mock("@aws-sdk/client-s3");
jest.mock("sharp");

describe("convertToWebp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  it("should convert a non-webp image to webp format", async () => {
    const mockBuffer = Buffer.from("fakeImage");
    const mockWebpBuffer = Buffer.from("fakeWebpImage");
    const mockFile = {
      mimetype: "image/jpeg",
      buffer: mockBuffer,
      originalname: "testImage.jpg",
    } as Express.Multer.File;

    (sharp as jest.MockedFunction<typeof sharp>).mockReturnValueOnce({
      toFormat: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValueOnce(mockWebpBuffer),
    } as unknown as ReturnType<typeof sharp>);

    const convertedFile = await convertToWebp(mockFile);

    expect(sharp).toHaveBeenCalledWith(mockBuffer);
    expect(convertedFile.mimetype).toBe("image/webp");
    expect(convertedFile.buffer).toBe(mockWebpBuffer);
    expect(convertedFile.originalname).toBe("testImage.webp");
  });

  it("should not convert if the file is already a webp image", async () => {
    const mockBuffer = Buffer.from("fakeImage");
    const mockFile = {
      mimetype: "image/webp",
      buffer: mockBuffer,
      originalname: "testImage.webp",
    } as Express.Multer.File;

    const convertedFile = await convertToWebp(mockFile);

    expect(sharp).not.toHaveBeenCalled();
    expect(convertedFile.mimetype).toBe("image/webp");
    expect(convertedFile.buffer).toBe(mockBuffer);
    expect(convertedFile.originalname).toBe("testImage.webp");
  });
});

describe("uploadFile", () => {
  const mockS3Client = S3Client as jest.MockedClass<typeof S3Client>;
  const mockSend = jest.fn();

  beforeEach(() => {
    mockS3Client.prototype.send = mockSend;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should upload a file to S3 and return the file URL", async () => {
    const mockBuffer = Buffer.from("fakeImage");
    const mockFile = {
      buffer: mockBuffer,
      originalname: "testImage.webp",
      mimetype: "image/webp",
    } as Express.Multer.File;

    const clubId = "123";
    const expectedKey = `clubs/${clubId}/${Date.now()}_testImage.webp`;
    const expectedUrl = `https://bucket-name.s3.us-east-1.amazonaws.com/${expectedKey}`;

    mockSend.mockResolvedValueOnce({});

    const result = await uploadFile(mockFile, clubId);

    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: expect.any(String),
      Key: expect.stringMatching(/clubs\/123\/\d+_testImage\.webp/),
      Body: mockBuffer,
      ContentType: "image/webp",
    });

    expect(result).toMatch(/^https:\/\/.+\.s3\..+\.amazonaws\.com\/.+$/);
  });

  it("should throw an error if the upload fails", async () => {
    const mockBuffer = Buffer.from("fakeImage");
    const mockFile = {
      buffer: mockBuffer,
      originalname: "testImage.webp",
      mimetype: "image/webp",
    } as Express.Multer.File;

    const clubId = "123";
    mockSend.mockRejectedValueOnce(new Error("Upload error"));

    await expect(uploadFile(mockFile, clubId)).rejects.toThrow("Upload error");
  });
});
