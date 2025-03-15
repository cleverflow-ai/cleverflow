import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://gitea.clevernow.com/api/v1", //process.env.GITEA_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    }
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log(error);
        if (!error.response) {
            // Handle network errors
            if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED" || error.code === "ERR_INVALID_URL") {
                // Retry up to 3 times before failing
                error.config._retryCount = error.config._retryCount || 0;
                if (error.config._retryCount < 3) {
                    error.config._retryCount += 1;
                    return axiosInstance.request(error.config);
                }

                return Promise.reject(error);
            }
        } else {
            // Handle HTTP errors based on status codes
            switch (error.response.status) {
                case 401: // ERR_UNAUTHORIZED
                    try {
                        return axiosInstance.request(error.config);
                    } catch (err) {
                        return Promise.reject(error);
                    }
                case 400: // ERR_BAD_REQUEST
                case 403: // ERR_FORBIDDEN
                case 404: // ERR_NOT_FOUND
                case 500: // ERR_BAD_RESPONSE
                default:
                    return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

axiosInstance.interceptors.request.use((config) => {
    const token = process.env.PAT;

    if (token && config.url) {
        const url = new URL(config.url, config.baseURL);
        // Check if the token already exists in the URL
        if (!url.searchParams.has("token")) {
            url.searchParams.append("token", token);
            config.url = url.pathname + url.search; // Update config.url with new query params
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
