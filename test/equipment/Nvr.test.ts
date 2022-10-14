import {Nvr} from '../../src/equipment/Nvr';
import {sleep} from '../../src/utils/Common';

// Set jest.setTimeout to 30 seconds
jest.setTimeout(30000);

describe('Nvr', () => {
    const _global: any = typeof window === 'undefined' ? global : window;
    // const nvr = new Nvr(_global.nvrConfig);
    const nvr = new Nvr({
        ip: '31.154.238.34',
        wsPort: 80,
        user: 'mobile',
        password: 'Mobile123',
        version: 20,
    });
    let channelSize = 0;

    beforeAll(async () => {
        return await nvr.connect();
    });

    test('connect', () => {
        if (nvr.version === 1) {
            expect(nvr.getSession().length).not.toBe(0);
        }
    });

    test('deviceInfo', async () => {
        const deviceInfo = await nvr.deviceInfo();

        // Expect that deviceInfo has all required properties from interface DeviceInfo
        expect(deviceInfo).toHaveProperty('name');
        expect(deviceInfo).toHaveProperty('id');
        expect(deviceInfo).toHaveProperty('model');
        expect(deviceInfo).toHaveProperty('serialNo');
        expect(deviceInfo).toHaveProperty('mac');
        expect(deviceInfo).toHaveProperty('firmwareVersion');
        expect(deviceInfo).toHaveProperty('firmwareReleaseDate');
        expect(deviceInfo).toHaveProperty('encoderVersion');
        expect(deviceInfo).toHaveProperty('encoderReleaseDate');
        expect(deviceInfo).toHaveProperty('deviceType');
        expect(deviceInfo).toHaveProperty('code');
    });

    test('ssh', async () => {
        const status = await nvr.getSSHStatus();
        // Expect status to be boolean
        expect(typeof status).toBe('boolean');
        expect(status).not.toBeUndefined();
    });

    test('fetchChannelsBefore', async () => {
        const channels = await nvr.fetchChannels();
        channelSize = channels.length;
    });

    test('addChannel', async () => {
        await nvr.addChannel({ip: '10.233.233.233', userName: 'admin', password: 'password', protocol: 'HIKVISION'});
        await nvr.addChannel({ip: '10.233.233.234', userName: 'admin', password: 'password', protocol: 'HIKVISION'});
    });

    test('fetchChannels', async () => {
        const channels = await nvr.fetchChannels();
        expect(channels.length).toBe(channelSize + 2);
    });

    test('deleteChannel', async () => {
        await nvr.deleteChannel('10.233.233.234');
        await nvr.deleteChannel('10.233.233.233');
    });

    test('fetchUsers', async () => {
        const users = await nvr.fetchUsers();
        expect(users.length).toBeGreaterThan(0);
        expect(users[0]).toHaveProperty('userName');
        expect(users[0]).toHaveProperty('id');
        expect(users[0]).toHaveProperty('type');
        // const admin = users.find(u => u.userName === 'admin');
        // expect(admin).not.toBeUndefined();
        // expect(admin!.type).toBe('Administrator');
    });

    test('addUser', async () => {
        await nvr.addUser({
            id: 0,
            userName: 'testUser0',
            type: 'Operator',
            password: 'a12345678'
        });
        const users = await nvr.fetchUsers();
        const user0 = users.find(u => u.userName === 'testUser0');
        expect(user0).not.toBeUndefined();
        expect(user0!.type).toBe('Operator');
    });

    test('updateUser', async () => {
        const users = await nvr.fetchUsers();
        const user0 = users.find(u => u.userName === 'testUser0');
        expect(user0).not.toBeUndefined();
        user0!.type = 'Viewer';
        user0!.password = 'a87654321';
        await nvr.updateUser(user0!);
        const _users = await nvr.fetchUsers();
        const _user0 = _users.find(u => u.userName === 'testUser0');
        expect(_user0).not.toBeUndefined();
        expect(_user0!.type).toBe('Viewer');
    });

    test('deleteUses', async () => {
        const users = await nvr.fetchUsers();
        const user0 = users.find(u => u.userName === 'testUser0');
        expect(user0).not.toBeUndefined();
        await nvr.deleteUser(user0!.id);
    });

    test('direction', async () => {
        await nvr.direction(1, 60, 0);
        await sleep(2000);
        await nvr.direction(1, 0, 0);
        await nvr.direction(1, -60, 0);
        await sleep(2000);
        await nvr.direction(1, 0, 0);
        await nvr.direction(1, 0, 60);
        await sleep(2000);
        await nvr.direction(1, 0, 0);
        await nvr.direction(1, 0, -60);
        await sleep(2000);
        await nvr.direction(1, 0, 0);
    }, 15000);


    test('focus', async () => {
        await nvr.focus(1, 60);
        await sleep(500);
        await nvr.focus(1, 0);
        await nvr.focus(1, -60);
        await sleep(500);
        await nvr.focus(1, 0);
    });

    test('zoom', async () => {
        await nvr.zoom(1, 60);
        await sleep(2000);
        await nvr.zoom(1, 0);
        await nvr.zoom(1, -60);
        await sleep(2000);
        await nvr.zoom(1, 0);
    }, 8000);

    test('websocket', async () => {
        const ws = await nvr.getWebsocketUrl();
        expect(ws).not.toBeUndefined();
        expect(ws.length).toBeGreaterThan(0);
    }, 30000);

    test('RTSP 1', async () => {
        const rtsp = await nvr.getRtsp();
        expect(rtsp).not.toBeUndefined();
    }, 30000);
});
