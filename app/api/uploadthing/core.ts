import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAuth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const uploadRouter = {
  submissionFile: f({
    pdf: { maxFileSize: "64MB", maxFileCount: 20 },
    "application/msword": { maxFileSize: "64MB", maxFileCount: 20 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "64MB", maxFileCount: 20 },
    "application/zip": { maxFileSize: "64MB", maxFileCount: 20 }
  })
    .middleware(async ({ req }) => {
      const { userId } = await getAuth(req);
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
