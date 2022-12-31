const BACKEND_HOST = process.env.BACKEND_HOST_IP !== undefined? process.env.BACKEND_HOST_IP:'localhost';
const GRPC_HOST = process.env.GRPC_HOST_IP !== undefined? process.env.GRPC_HOST_IP:'localhost';

export function getServerAddress() {
    return "http://"+BACKEND_HOST+":8080";
}

export function getWebsocketAddress() {
    return "ws://"+BACKEND_HOST+":8080/ws";
}

export function getGrpcAddress() {
    return "http://"+GRPC_HOST+":8081";
}

export function redirect(url) {
    window.history.pushState(null, '', url);
    window.location.href = url;
}

export function mapAndRethrowError(axiosError) {
    if (!axiosError.response || !axiosError.response.status) {
        throw new Error("Network error! Server is not responding!");
    }
    if (axiosError.response.status !== 200 && axiosError.response.status !== 201) {
        if (!axiosError.response.data || !axiosError.response.data.message) {
            throw new Error("Unexpected error occurred!");
        }
        let error = new Error(axiosError.response.data.message);
        error.errors = axiosError.response.data.errors;
        throw error;
    }
}


