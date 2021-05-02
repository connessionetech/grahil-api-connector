// custom error types

export const REST_API_ERROR = "RestApiError";
export const CONNECTION_TIMEOUT_ERROR = "ConnectionTimeoutError";
export const SOCKET_RPC_ERROR = "SocketRPCError";
export const AUTHENTICATON_ERROR = "AuthenticationError";

export class ConnectionTimeoutError extends Error {
    constructor(m?: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ConnectionTimeoutError.prototype);
        this.name = CONNECTION_TIMEOUT_ERROR;
    }
}


export class AuthenticationError extends Error {
    constructor(m?: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, AuthenticationError.prototype);
        this.name = AUTHENTICATON_ERROR;
    }
}


export class SocketRPCError extends Error {
    constructor(m?: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, SocketRPCError.prototype);
        this.name = SOCKET_RPC_ERROR;
    }
}



export class RestApiError extends Error {
    constructor(m?: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, RestApiError.prototype);
        this.name = REST_API_ERROR;
    }
}