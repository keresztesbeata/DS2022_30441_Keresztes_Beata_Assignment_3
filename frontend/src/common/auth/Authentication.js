import axios from "axios";
import {getServerAddress, mapAndRethrowError, redirect} from "../Utils";
import React from "react";
import {ErrorPage} from "../ErrorPage";

const HOME_PAGE = "/";

const LOGIN_ENDPOINT = "/login";
const REGISTER_ENDPOINT = "/register";
const LOGOUT_ENDPOINT = "/logout";

export const AUTHORITIES = "authorities";
export const TOKEN = "token";
export const USERNAME = "username";

export const CLIENT_ROLE = "CLIENT";
export const ADMIN_ROLE = "ADMIN";

/**
 * Verify if the user is logged in.
 * @returns {boolean}
 */
export function isLoggedIn() {
    return sessionStorage.getItem(TOKEN) !== null;
}

/**
 * Verify if the user is logged in and has the necessary authority to access the resources.
 * @param authority
 * @returns {boolean}
 */
export function isAuthorized(authority) {
    return isLoggedIn() && sessionStorage.getItem(AUTHORITIES) !== null && sessionStorage.getItem(AUTHORITIES).includes(authority);
}

/**
 * Send a login request to the server with the given credentials.
 * @param username
 * @param password
 * @returns {Promise<AxiosResponse<any>>}
 * @constructor
 */
export function Login(username, password) {
    const url = getServerAddress() + LOGIN_ENDPOINT;

    return axios.post(url, {
        username: username, password: password
    })
        .then((response) => {
            if (response.status === 200) {
                // successful login
                sessionStorage.setItem(TOKEN, response.data.accessToken);
                sessionStorage.setItem(USERNAME, response.data.username);
                sessionStorage.setItem(AUTHORITIES, response.data.authorities);
                redirect(HOME_PAGE);
            }
        })
        .catch(error => mapAndRethrowError(error));
}

/**
 * Registers the user with the given account data.
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 * @constructor
 */
export function Register(data) {
    const url = getServerAddress() + REGISTER_ENDPOINT;
    return axios.post(url, data)
        .catch(error => mapAndRethrowError(error));
}

/**
 * Logs out the user, removing its authorization from the local storage.
 * @returns {Promise<AxiosResponse<any>>}
 * @constructor
 */
export function Logout() {
    const url = getServerAddress() + LOGOUT_ENDPOINT;
    if (isLoggedIn()) {
        axios.post(url, {}, {
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem(TOKEN)
            }
        })
            .then(() => {
                sessionStorage.removeItem(TOKEN);
                sessionStorage.removeItem(AUTHORITIES);
                sessionStorage.removeItem(USERNAME);
                redirect(HOME_PAGE);
            })
            .catch(error => mapAndRethrowError(error));
    }
}

/**
 * Verify the authorization of the user before returning the requested resource.
 * In case the user lacks the authorization, it returns an error page with a corresponding error message
 * @param component
 * @param authority
 * @returns {JSX.Element}
 * @constructor
 */
export function ProtectedComponent({component, authority}) {
    return !isLoggedIn() ?
        // redirect to the login page if the user is not logged in
        <ErrorPage message={"Unauthorized access! You cannot view this page, because you are not logged in!"}/>
        :
        (isAuthorized(authority) ?
                // if authorized return the component
                component
                : // if not authorized return an error page
                <ErrorPage
                    message={"Unauthorized access! You cannot view this page, because you do not have sufficient" +
                        " access rights."}/>
        )
}