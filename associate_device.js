import fetch from 'node-fetch';

const API_URL = 'https://api01.fleetr.app/api/v1/core/';
const API_KEY = '?access_token=3IjpnxRfoDnZXNUSQdsPPBIhZnW1OtyAHOcJbb2w';

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function getEntity(entityType, filter) {
    const response = await fetchJson(API_URL + entityType + API_KEY + '&filter=' + JSON.stringify(filter));
    return response[0];
}

async function createEntity(entityType, data) {
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    const response = await fetchJson(API_URL + entityType + API_KEY, options);
    return response;
}

async function updateEntity(entityType, entityId, data) {
    const options = {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    const response = await fetchJson(API_URL + entityType + '/' + entityId + API_KEY, options);
    return response;
}

async function associateEntity(entityType, tenantId, entityId) {
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            [`${entityType}s`]: [entityId]
        })
    };
    const response = await fetch(`${API_URL}tenants/${tenantId}/${entityType}s${API_KEY}`, options);
    const result = await response.text();
    return result;
}

async function main() {
    try {
        const deviceImei = '865640069765128';
        const tenantName = 'Secur-Tek, Inc';

        const device = await getEntity('devices', { imei: deviceImei });
        const tenant = await getEntity('tenants', { name: tenantName });

        const driver = await createEntity('users', {
            name: 'Driver13',
            email: '13bhoneycutt@secur-tek.com'
        });

        const vehicle = await createEntity('vehicles', {
            patent: 'FLEETR13',
            year: 2024,
            alias: 'Vehicle 13',
            active: true,
            user: driver.id
        });

        await updateEntity('devices', device._id, {
            id: device._id,
            status: 'preactive',
            vehicle: vehicle.id,
            user: driver.id,
            warehouse: '5ed18fd67ebee14f4aac4046'
            // ... Other fields you need to update
        });

        await associateEntity('device', tenant.id, device._id);
        await associateEntity('user', tenant.id, driver.id);

        console.log('Device associated with tenant:', tenant.id);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();