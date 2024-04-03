import { useState, Component } from 'react'
import { Readable, Writable, PassThrough } from 'stream-browserify'
import { MavLinkPacketRegistry, minimal, common, ardupilotmega, MavLinkPacketSplitter, MavLinkPacketParser } from 'node-mavlink'
import { useWebSerial } from "@mniota/react-webserial-hook"

const MavlinkConnectionContext = {
    initialized: false,
    reader: null,
};
export function useMavlinkConnection({ onData, onPacket, onError}) {
    const [isConnectedToSerial, setIsConnectedToSerial] = useState(false);
    const [isConnectedToWebSocket, setIsConnectedToWebSocket] = useState(false);

    const _onData = (data) => {
        if (onData) {
            onData(data);
        }
    }

    const _onPacket = (packet) => {
        if (onPacket) {
            onPacket(packet);
        }
    }

    const _onError = (error) => {
        if (onError) {
            onError(error);
        }
    }

    const serial = useWebSerial({})

    const webRSToNodeRS = rs => {
        MavlinkConnectionContext.reader = rs.getReader();
        const out = new PassThrough();
        MavlinkConnectionContext.reader.read().then(async ({ value, done }) => {
            while (!done) {
                out.push(value);
                ({ done, value } = await MavlinkConnectionContext.reader.read());
            }
            out.push(null);
        });
        return out;
    }

    const webWSToNodeWS = ws => {
        const writer = ws.getWriter();
        const out = new PassThrough();
        out._write = (chunk, encoding, callback) => {
            writer.write(chunk);
            callback();
        };
        out._final = callback => {
            writer.close();
            callback();
        };
        return out;
    }

    const REGISTRY = {
        ...minimal.REGISTRY,
        ...common.REGISTRY,
        ...ardupilotmega.REGISTRY
    }

    const connectWebSerial = async (baud) => {
        try {
            if (typeof serial === 'undefined') {
                return
            }

            await serial.requestPort();
            serial.options.setBaudRate(baud);
            await serial.openPort();
            setIsConnectedToSerial(true);

            const reader = webRSToNodeRS(serial.port.readable).pipe(new MavLinkPacketSplitter()).pipe(new MavLinkPacketParser());
            reader.on('data', packet => {
                _onPacket(packet)
                const clazz = REGISTRY[packet.header.msgid]
                if (clazz) {
                    const data = packet.protocol.data(packet.payload, clazz)
                    _onData(data)
                }
            })
            setIsConnectedToSerial(true);
        } catch (error) {
            _onError(error)
            setIsConnectedToSerial(false);
        }
    };

    const disconnectWebSerial = async () => {
        try {
            await MavlinkConnectionContext.reader.cancel();
            await serial.port.close()
        } catch (error) {
            _onError(error)
        }
        setIsConnectedToSerial(false);
    };

    const connectWebSocket = async (address) => {
        try {
            console.log(address)
            //TODO: Implement
            setIsConnectedToWebSocket(true);
        } catch (error) {
            _onError(error)
            setIsConnectedToWebSocket(false);
        }
    };

    const disconnectWebSocket = async () => {
        try {
            console.log("Disconnecting from WebSocket")
            //TODO: Implement
        } catch (error) {
            _onError(error)
        }
        setIsConnectedToWebSocket(false);
    };

    return {
        connectWebSerial,
        disconnectWebSerial,
        connectWebSocket,
        disconnectWebSocket,
        isConnectedToSerial,
        isConnectedToWebSocket,
    }
}
