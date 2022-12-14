import http from "@/utils/http";

const backendBaseUrl = "/backend-api/upload";
const api = {
  check: backendBaseUrl + "/check",
  chunk: backendBaseUrl + "/chunk",
  merge: backendBaseUrl + "/merge",
};

const upload = {
  check(fileHash: string) {
    return http.get(api.check, {
      params: {
        fileHash: fileHash,
      },
    });
  },
  chunk(formData) {
    return http.post(api.chunk, formData);
  },
  merge(filename: string, fileHash: string, chunkSize: number) {
    return http.get(api.merge, {
      params: {
        filename: filename,
        fileHash: fileHash,
        chunkSize: chunkSize,
      },
    });
  },
};

export default upload;
