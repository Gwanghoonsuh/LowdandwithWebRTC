#!/bin/bash

echo "🚀 WebRTC 애플리케이션 시작 중..."
echo "📡 Google STUN 서버만 사용 (Coturn 서버 없음)"
echo "🌍 외부 접근 허용됨"
echo ""

# 기존 프로세스 종료
echo "🔄 기존 프로세스 정리 중..."
pkill -f "node server.js" 2>/dev/null
echo "✅ 기존 프로세스 정리 완료"
echo ""

# 시그널링 서버 시작
echo "📡 시그널링 서버 시작 중..."
cd signaling-server
npm install
npm start &
SIGNALING_PID=$!
cd ..
echo "✅ 시그널링 서버 시작됨 (PID: $SIGNALING_PID)"
echo ""

# 잠시 대기
sleep 3

# 클라이언트 서버 시작
echo "🌐 클라이언트 서버 시작 중..."
cd client-server
npm install
npm start &
CLIENT_PID=$!
cd ..
echo "✅ 클라이언트 서버 시작됨 (PID: $CLIENT_PID)"
echo ""

# 잠시 대기
sleep 3

echo "🎉 모든 서비스가 시작되었습니다!"
echo ""
echo "📱 클라이언트: http://localhost:3001"
echo "📡 시그널링 서버: http://localhost:3000"
echo "🔧 Google STUN 서버만 사용 (Coturn 서버 없음)"
echo ""
echo "🌍 외부 접근 정보:"
echo "  - 클라이언트: http://[YOUR_IP]:3001"
echo "  - 시그널링: http://[YOUR_IP]:3000"
echo "  - [YOUR_IP]는 실제 서버의 IP 주소로 변경하세요"
echo ""
echo "⚠️  외부 접근을 위해서는 방화벽에서 3000, 3001 포트를 열어야 합니다."
echo ""

# 프로세스 상태 확인
echo "📊 프로세스 상태:"
ps aux | grep "node server.js" | grep -v grep

echo ""
echo "🔍 서비스 상태 확인:"
echo "시그널링 서버: http://localhost:3000/health"
echo "클라이언트 서버: http://localhost:3001"
echo ""
echo "🌐 외부 접근 테스트:"
echo "다른 기기에서 http://[YOUR_IP]:3001 로 접속해보세요"
