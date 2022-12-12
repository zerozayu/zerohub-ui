import http from "@/utils/http";

const backendBaseUrl = "/backend-api/upload";
const api = {
  check: backendBaseUrl + "/check",
  chunk: backendBaseUrl + "/chunk",
  merge: backendBaseUrl + "/merge",
};

const upload = {
  check(chunkHash: string, currChunkNo: string) {
    return http.get(api.check, {
      params: {
        chunkHash: chunkHash,
        currChunkNo: currChunkNo,
      },
    });
  },
  chunk(formData) {
    return http.post(api.chunk, formData);
  },
  merge(fileHash, filename) {
    return http.get(api.merge, {
      params: {
        fileHash: fileHash,
        filename: filename,
      },
    });
  },
};

export default upload;
