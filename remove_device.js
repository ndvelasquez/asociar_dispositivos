const API_URL = 'https://api01.fleetr.app/api/v1/core/';
const API_KEY = '?access_token=eQ96HpsBq9Jgo2Q7Z00Ai87DwgCnKeeq4mzBz0Of';

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function getDevice(deviceImei) {
    try {
        const filter = {
            imei: deviceImei
        };
        const params = new URLSearchParams({
            filter: JSON.stringify(filter)
        });
        const response = await fetchJson(API_URL + 'devices' + API_KEY + '&' + params.toString());
        if (!Array.isArray(response) || response.length === 0) {
            throw new Error('Device not found or invalid response');
        }
        return {
            id: response[0]._id,
            imei: response[0].imei,
            serial: response[0].serial,
            iccid: response[0].iccid,
            provider: response[0].provider,
            type: response[0].type,
            alias: '',
            firmware: response[0].firmware,
            configVersion: response[0].configVersion,
            modelN: response[0].modelN,
            setupkey: response[0].setupkey,
            status: response[0].status,
            used: false,
            forceVehicle: false,
            tenants: response[0].tenants[0],
            vehicle: '',
            user: response[0].user,
        };
    } catch (error) {
        console.error('Error fetching device data:', error);
        throw error;
    }
}

async function removeTenant(device) {
    try {
        const requestOptions = {
            method: 'DELETE',
            redirect: 'follow'
        };
        const response = await fetch("https://api01.fleetr.app/api/v1/core/tenants/" + device.tenants + "/devices/" + device.id + API_KEY, requestOptions);
        const result = await response.text();

        return result;
    } catch (error) {
        console.log('error:', error);
    }
}

async function removeUserTenant(device) {
    try {
        const requestOptions = {
            method: 'DELETE',
            redirect: 'follow'
        };
        const response = await fetch("https://api01.fleetr.app/api/v1/core/tenants/" + device.tenants + "/users/" + device.user + API_KEY, requestOptions);
        const result = await response.text();

        return result;
    } catch (error) {
        console.log('error:', error);
    }
}

async function updateDevice(device) {
    try {
        const options = {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "id": device.id,
                "imei": device.imei,
                "serial": device.serial,
                "iccid": device.iccid,
                "provider": device.provider,
                "type": device.type,
                "alias": "",
                "firmware": device.firmware,
                "configVersion": device.configVersion,
                "modelN": device.modelN,
                "setupkey": device.setupkey,
                "status": "preactive",
                "used": false,
                "forceVehicle": false,
                "vehicle": null,
                "user": null,
                "warehouse": "5ed18fd67ebee14f4aac4046",
                "assignmentPriority": 0,
                "discardBef": null,
                "display": {
                    "warehouse": "Fleetr USA"
                },
                "tags": ["fleetr", "fleetr:billingTier:pro"]
            })
        };

        const response = await fetchJson(API_URL + 'devices/' + device.id + API_KEY, options);
        return response.id;
    } catch (error) {
        console.error('Error updating device:', error);
        throw error;
    }
}

async function processDevicesInBatches(devices, batchSize) {
    for (let i = 0; i < devices.length; i += batchSize) {
        const batch = devices.slice(i, i + batchSize);
        const devicePromises = batch.map(async (item) => {
            try {
                const device = await getDevice(item);
                await removeTenant(device);
                await removeUserTenant(device);
                const deviceId = await updateDevice(device);
                console.log('device updated: ', deviceId);
            } catch (error) {
                console.error(`Error processing device ${item}:`, error.message);
            }
        });
        await Promise.all(devicePromises);
    }
}

async function main() {
    try {
        const devices = 
        [
            866392060891789,
            866392060934571,
            866392060553801,
            866392060907650,
            866392060574377
        ]
        const batchSize = 4; // El tamaño del lote que deseas procesar a la vez
        await processDevicesInBatches(devices, batchSize);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();