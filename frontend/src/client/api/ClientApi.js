import axios from "axios";
import {getServerAddress, mapAndRethrowError} from "../../common/Utils";
import {TOKEN} from "../../common/auth/Authentication";

const CLIENT_ENDPOINT = "/client"
const DEVICES_ENDPOINT = CLIENT_ENDPOINT + "/devices"
const ENERGY_CONSUMPTION_ENDPOINT = CLIENT_ENDPOINT + "/energy_consumption"

/**
 * Fetch all devices associated to the currently logged in client.
 * @returns {Promise<AxiosResponse<any>>}
 */
export function GetDevicesOfClient() {
    const config = {
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem(TOKEN),
        }
    }
    const url = getServerAddress() + DEVICES_ENDPOINT;

    return axios.get(url, config)
        .then((response) => {
            if (response.status === 200) {
                return response.data;
            }
        })
        .catch(error => mapAndRethrowError(error));
}

/**
 * Fetch the total energy consumption of every device associated to the currently logged in client for each hour.
 * @returns {Promise<AxiosResponse<any>>}
 */
export function GetEnergyConsumptionByDay(day) {
    const config = {
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem(TOKEN),
        },
        params: {
            date: day
        }
    }
    const url = getServerAddress() + ENERGY_CONSUMPTION_ENDPOINT;

    return axios.get(url, config)
        .then((response) => {
            if (response.status === 200) {
                return response.data;
            }
        })
        .catch(error => mapAndRethrowError(error));
}

/**
 * Fetch the energy consumption of the given device associated to the currently logged in client for each hour.
 * @returns {Promise<AxiosResponse<any>>}
 */
export function GetEnergyConsumptionByDayAndDeviceId(day, deviceId) {
    const url = getServerAddress() + ENERGY_CONSUMPTION_ENDPOINT + "/" + deviceId;
    const config = {
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem(TOKEN),
        },
        params: {
            date: day
        }
    }

    return axios.get(url, config)
        .then((response) => {
            if (response.status === 200) {
                return response.data;
            }
        })
        .catch(error => mapAndRethrowError(error));
}
