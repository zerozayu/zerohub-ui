import http from "@/utils/http";

const backendBaseUrl = "/backend-api/upload";
const api = {
  chunk: backendBaseUrl + "/chunk",
  merge: backendBaseUrl + "/merge",
};

const upload = {
  chunk(formData) {
    return http.post(api.chunk, formData);
  },
  merge(hash, file) {
    return http.get(api.merge, {
      params: {
        hash: hash,
        filename: file,
      }
    });
  },
};

export default upload;
