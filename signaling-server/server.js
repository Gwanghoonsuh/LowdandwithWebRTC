const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// 환경 감지
const isProduction = process.env.NODE_ENV === 'production';

// 보안 헤더 설정
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "ws:", "wss:"],
            mediaSrc: ["'self'", "blob:"],
            objectSrc: ["'none'"]
        }
    }
}));

// CORS 설정 - 모든 도메인 허용 (테스트 용이성)
app.use(cors({
    origin: true, // 모든 도메인 허용
    credentials: true
}));

// Socket.IO 설정
const io = socketIo(server, {
    cors: {
        origin: true, // 모든 도메인 허용
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// 방 관리
const rooms = new Map();

// Socket.IO 연결 처리
io.on('connection', (socket) => {
    console.log('새로운 클라이언트 연결:', socket.id);

    // 방 참가
    socket.on('join-room', (roomId, username) => {
        // 방이 없으면 생성
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }

        const room = rooms.get(roomId);

        // 사용자 정보 저장
        socket.roomId = roomId;
        socket.username = username;
        socket.join(roomId);

        // 방에 사용자 추가
        room.add(socket.id);

        // 방의 다른 사용자들에게 새 사용자 참가 알림
        socket.to(roomId).emit('user-joined', {
            id: socket.id,
            username: username
        });

        // 방의 기존 사용자 목록 전송
        const users = Array.from(room).filter(id => id !== socket.id);
        socket.emit('room-users', users);

        console.log(`${username}님이 방 ${roomId}에 참가했습니다. (총 ${room.size}명)`);
    });

    // 방 퇴장
    socket.on('leave-room', () => {
        if (socket.roomId) {
            const room = rooms.get(socket.roomId);
            if (room) {
                room.delete(socket.id);

                // 방이 비어있으면 삭제
                if (room.size === 0) {
                    rooms.delete(socket.roomId);
                    console.log(`방 ${socket.roomId}가 삭제되었습니다.`);
                } else {
                    // 다른 사용자들에게 퇴장 알림
                    socket.to(socket.roomId).emit('user-left', {
                        id: socket.id,
                        username: socket.username
                    });
                    console.log(`${socket.username}님이 방 ${socket.roomId}에서 퇴장했습니다. (남은 인원: ${room.size}명)`);
                }
            }
        }
    });

    // WebRTC 시그널링
    socket.on('offer', (data) => {
        socket.to(data.target).emit('offer', {
            from: socket.id,
            offer: data.offer
        });
    });

    socket.on('answer', (data) => {
        socket.to(data.target).emit('answer', {
            from: socket.id,
            answer: data.answer
        });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.target).emit('ice-candidate', {
            from: socket.id,
            candidate: data.candidate
        });
    });

    // 화면 공유
    socket.on('screen-share-started', (roomId) => {
        socket.to(roomId).emit('screen-share-started', socket.id);
    });

    socket.on('screen-share-stopped', (roomId) => {
        socket.to(roomId).emit('screen-share-stopped', socket.id);
    });

    // 채팅
    socket.on('chat-message', (data) => {
        socket.to(data.roomId).emit('chat-message', {
            username: socket.username,
            message: data.message,
            timestamp: new Date().toISOString()
        });
    });

    // 연결 해제
    socket.on('disconnect', () => {
        console.log('클라이언트 연결 해제:', socket.id);

        // 방에서 사용자 제거
        if (socket.roomId) {
            const room = rooms.get(socket.roomId);
            if (room) {
                room.delete(socket.id);

                // 방이 비어있으면 삭제
                if (room.size === 0) {
                    rooms.delete(socket.roomId);
                    console.log(`방 ${socket.roomId}가 삭제되었습니다.`);
                } else {
                    // 다른 사용자들에게 퇴장 알림
                    socket.to(socket.roomId).emit('user-left', {
                        id: socket.id,
                        username: socket.username
                    });
                    console.log(`${socket.username}님이 방 ${socket.roomId}에서 퇴장했습니다. (남은 인원: ${room.size}명)`);
                }
            }
        }
    });
});

// 상태 확인 엔드포인트
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: 'external-access-enabled',
        rooms: rooms.size,
        totalUsers: Array.from(rooms.values()).reduce((sum, room) => sum + room.size, 0),
        note: 'Google STUN 서버만 사용 (Coturn 서버 없음), 외부 접근 허용됨'
    });
});

// 서버 시작
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WebRTC 시그널링 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`📡 Socket.IO 서버: http://localhost:${PORT}`);
    console.log(`🌍 외부 접근: http://0.0.0.0:${PORT}`);
    console.log(`🔧 Google STUN 서버만 사용 (Coturn 서버 없음)`);
    console.log(`✅ 외부 접근 허용됨`);
});

module.exports = app;

