const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 미들웨어 설정
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "ws:", "wss:"],
            mediaSrc: ["'self'", "blob:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 방 관리
const rooms = new Map();
const MAX_PARTICIPANTS = 8;

// Socket.IO 연결 처리
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 방 참가
    socket.on('join-room', (roomId, username) => {
        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                participants: new Map(),
                maxParticipants: MAX_PARTICIPANTS
            });
        }

        const room = rooms.get(roomId);

        if (room.participants.size >= room.maxParticipants) {
            socket.emit('room-full', '방이 가득 찼습니다. 최대 8명까지 참가 가능합니다.');
            return;
        }

        socket.join(roomId);
        room.participants.set(socket.id, {
            id: socket.id,
            username: username,
            isHost: room.participants.size === 0
        });

        // 방의 모든 참가자에게 새 참가자 정보 전송
        io.to(roomId).emit('user-joined', {
            id: socket.id,
            username: username,
            isHost: room.participants.get(socket.id).isHost,
            participants: Array.from(room.participants.values())
        });

        console.log(`${username} joined room ${roomId}. Total participants: ${room.participants.size}`);
    });

    // WebRTC 시그널링
    socket.on('offer', (data) => {
        socket.to(data.target).emit('offer', {
            offer: data.offer,
            from: socket.id
        });
    });

    socket.on('answer', (data) => {
        socket.to(data.target).emit('answer', {
            answer: data.answer,
            from: socket.id
        });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.target).emit('ice-candidate', {
            candidate: data.candidate,
            from: socket.id
        });
    });

    // 화면 공유 시작
    socket.on('screen-share-started', (roomId) => {
        socket.to(roomId).emit('screen-share-started', socket.id);
    });

    // 화면 공유 종료
    socket.on('screen-share-stopped', (roomId) => {
        socket.to(roomId).emit('screen-share-stopped', socket.id);
    });

    // 채팅 메시지
    socket.on('chat-message', (data) => {
        io.to(data.roomId).emit('chat-message', {
            id: socket.id,
            username: data.username,
            message: data.message,
            timestamp: new Date().toISOString()
        });
    });

    // 연결 해제 처리
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        // 모든 방에서 참가자 제거
        for (const [roomId, room] of rooms.entries()) {
            if (room.participants.has(socket.id)) {
                const participant = room.participants.get(socket.id);
                room.participants.delete(socket.id);

                // 방의 다른 참가자들에게 참가자 퇴장 알림
                socket.to(roomId).emit('user-left', {
                    id: socket.id,
                    username: participant.username,
                    participants: Array.from(room.participants.values())
                });

                // 방이 비어있으면 방 삭제
                if (room.participants.size === 0) {
                    rooms.delete(roomId);
                    console.log(`Room ${roomId} deleted (empty)`);
                }

                break;
            }
        }
    });
});

// API 엔드포인트
app.get('/api/rooms/:roomId/participants', (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
        participants: Array.from(room.participants.values()),
        maxParticipants: room.maxParticipants
    });
});

app.get('/api/rooms', (req, res) => {
    const roomList = Array.from(rooms.keys()).map(roomId => ({
        id: roomId,
        participantCount: rooms.get(roomId).participants.size,
        maxParticipants: rooms.get(roomId).maxParticipants
    }));

    res.json(roomList);
});

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
