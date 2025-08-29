const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// 환경 감지
const isProduction = process.env.NODE_ENV === 'production';

// 보안 헤더 설정
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.socket.io", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            connectSrc: [
                "'self'",
                "ws:",
                "wss:",
                "https://cdn.socket.io",
                // 모든 호스트에서 시그널링 서버 연결 허용
                "http://*:3000",
                "https://*:3000"
            ],
            mediaSrc: ["'self'", "blob:"],
            objectSrc: ["'none'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

// CORS 설정 - 모든 도메인 허용 (테스트 용이성)
app.use(cors({
    origin: true, // 모든 도메인 허용
    credentials: true
}));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// API 라우트 (시그널링 서버로 프록시)
app.get('/api/*', (req, res) => {
    const clientHost = req.get('host');
    const signalingUrl = `http://${clientHost.split(':')[0]}:3000`;

    res.json({
        message: 'API 요청은 시그널링 서버로 직접 전달하세요',
        signalingServer: signalingUrl,
        note: '외부 접근이 가능합니다. 시그널링 서버도 같은 호스트에서 실행해야 합니다.'
    });
});

// 404 페이지
app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 WebRTC 클라이언트 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`📱 클라이언트: http://localhost:${PORT}`);
    console.log(`🌍 외부 접근: http://0.0.0.0:${PORT}`);
    console.log(`📡 시그널링 서버: http://localhost:3000`);
    console.log(`🔧 Google STUN 서버만 사용 (Coturn 서버 없음)`);
    console.log(`✅ 외부 접근 허용됨`);
});

module.exports = app;


