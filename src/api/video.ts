import request from "@/utils/request"

export const hlsHttp = () => {
  return request({
      url: "/backend-api/video/hls",
      method: "get"
  })
}