import request from "@/utils/request";

export const searchAll = (query: any) => {
    return request({
        url: "/search",
        method: "get",
        params: query
    })
}

export const searchByFilename = (query: any) => {
    return request({
        url: "/search/filename",
        method: "get",
        params: query
    });
}

export const searchByContent = (query: any) => {
    return request({
        url: "/search/content",
        method: "get",
        params: query
    });
}

