# 🌐 WebRTC 실시간 화상 회의 애플리케이션

낮은 대역폭 환경(1Mbps 미만)에서도 HD 화질을 지원하는 실시간 화상 회의 애플리케이션입니다.

**✅ 외부 접근이 가능합니다! 다른 기기에서도 테스트할 수 있습니다.**

## ✨ 주요 기능

- **실시간 화상 회의**: 최대 8명 동시 참가
- **낮은 대역폭 최적화**: 1Mbps 미만에서도 HD 화질 지원
- **화면 공유**: 전체 화면 또는 특정 창 공유
- **실시간 채팅**: 텍스트 기반 채팅 시스템
- **화질 설정**: 사용자 정의 화질 및 대역폭 제어
- **반응형 UI**: 모바일 및 데스크톱 최적화
- **외부 접근**: 다른 기기에서도 테스트 가능

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌──────────────────┐
│   클라이언트    │    │   시그널링 서버  │
│   (포트 3001)   │◄──►│   (포트 3000)    │
└─────────────────┘    └──────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   Google STUN 서버  │
                    │   (무료, 안정적)    │
                    └─────────────────────┘
```

- **클라이언트 서버**: 정적 파일 제공 및 UI 렌더링
- **시그널링 서버**: WebRTC 연결을 위한 시그널링 처리
- **Google STUN 서버**: NAT 통과 지원 (Coturn TURN 서버 없음)

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 16.0.0 이상
- npm 또는 yarn
- **외부 접근을 위한 방화벽 설정**

### 설치 및 실행

```bash
# 1. 의존성 설치
npm run install:all

# 2. 모든 서비스 시작 (권장)
./start-all.sh

# 또는 개별적으로 시작
npm run start
```

#### 개별 서비스 시작

```bash
# 시그널링 서버 (포트 3000)
cd signaling-server && npm start

# 클라이언트 서버 (포트 3001)
cd client-server && npm start
```

### 브라우저에서 접속

#### 로컬 접속
```
클라이언트: http://localhost:3001
시그널링 서버: http://localhost:3000
상태 확인: http://localhost:3000/health
```

#### 외부 접속
```
클라이언트: http://[YOUR_IP]:3001
시그널링 서버: http://[YOUR_IP]:3000
[YOUR_IP]는 실제 서버의 IP 주소
```

### 🌍 외부 접근 설정

#### 1. 방화벽 설정
```bash
# macOS
sudo pfctl -e
sudo pfctl -f /etc/pf.conf

# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw allow 3001

# Windows
# Windows Defender 방화벽에서 3000, 3001 포트 허용
```

#### 2. IP 주소 확인
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig | findstr "IPv4"
```

#### 3. 외부 접근 테스트
- 다른 기기에서 `http://[YOUR_IP]:3001` 접속
- 시그널링 서버 상태 확인: `http://[YOUR_IP]:3000/health`

### 2. Railway에 배포 (추천)

#### 사전 준비
- [Railway 계정](https://railway.app) 생성
- [Railway CLI](https://docs.railway.app/develop/cli) 설치

```bash
npm install -g @railway/cli
```

#### 배포 단계

```bash
# 1. Railway에 로그인
railway login

# 2. 프로젝트 초기화
railway init

# 3. 프로젝트 배포
railway up

# 4. 도메인 확인
railway domain
```

#### 환경 변수 설정 (Railway 대시보드)

```bash
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
```

#### 배포 후 확인

1. **메인 페이지**: `https://your-project.railway.app`
2. **시그널링 서버**: `https://your-project.railway.app/api/signaling`
3. **상태 확인**: `https://your-project.railway.app/api/signaling/health`

### 3. Render에 배포

#### 사전 준비
- [Render 계정](https://render.com) 생성

#### 배포 단계

1. **GitHub 저장소 연결**
2. **서비스 생성**: Web Service 선택
3. **빌드 설정**:
   - Build Command: `npm run install:all`
   - Start Command: `npm start`
4. **환경 변수 설정**:
   ```bash
   NODE_ENV=production
   ```

### 4. Vercel에 배포 (제한적)

#### 주의사항
- **WebSocket 미지원**: Socket.IO 연결 불가
- **TURN 서버 불가**: Coturn 서버 실행 불가
- **제한된 기능**: 기본적인 정적 파일 서빙만 가능

#### 대안
Vercel에서는 WebRTC 기능을 사용할 수 없으므로, Railway나 Render 사용을 권장합니다.

## 🔧 기술 스택

- **프론트엔드**: HTML5, CSS3, JavaScript (ES6+)
- **백엔드**: Node.js, Express.js
- **실시간 통신**: Socket.IO
- **WebRTC**: RTCPeerConnection, MediaStream API
- **보안**: Helmet.js, CORS
- **배포**: Vercel

## 📱 사용 방법

### 1. 방 참가
1. 사용자 이름과 방 ID 입력
2. "방 참가" 버튼 클릭
3. 카메라 및 마이크 권한 허용

### 2. 화상 회의
- **비디오 토글**: 카메라 켜기/끄기
- **오디오 토글**: 마이크 켜기/끄기
- **화면 공유**: 전체 화면 또는 특정 창 공유
- **채팅**: 실시간 텍스트 메시지

### 3. 설정 조정
- **화질**: 낮음/보통/높음/HD
- **대역폭**: 100Kbps ~ 2Mbps
- **프레임 레이트**: 15fps ~ 60fps
- **오디오 품질**: 낮음/보통/높음

## 🌐 네트워크 설정

### STUN/TURN 서버
- **Google STUN**: `stun:stun.l.google.com:19302`
- **로컬 Coturn**: `turn:localhost:3478` (로컬 환경만)

### 포트 설정
- **클라이언트**: 3001
- **시그널링**: 3000
- **Coturn**: 3478 (UDP), 5349 (TLS)

## 🐛 문제 해결

### 일반적인 문제

#### 1. 연결 실패
```bash
# 서비스 상태 확인
curl http://localhost:3000/health
curl http://localhost:3001/health

# 포트 사용 확인
lsof -i :3000
lsof -i :3001
lsof -i :3478
```

#### 2. WebRTC 연결 오류
- 브라우저 콘솔에서 오류 메시지 확인
- 네트워크 연결 상태 점검
- 방화벽 설정 확인

#### 3. 미디어 스트림 문제
- 카메라/마이크 권한 확인
- 다른 브라우저에서 테스트
- 하드웨어 연결 상태 점검

### 디버깅

#### 로그 확인
```bash
# 시그널링 서버 로그
cd signaling-server && npm run dev

# 클라이언트 서버 로그
cd client-server && npm run dev

# Coturn 서버 로그
cd coturn && turnserver -c turnserver.conf -v
```

#### 브라우저 개발자 도구
- **Console**: JavaScript 오류 및 로그
- **Network**: WebSocket 연결 상태
- **Media**: 미디어 스트림 정보

## 📊 성능 최적화

### 대역폭 최적화
- **동적 품질 조정**: 네트워크 상태에 따른 자동 화질 조정
- **프레임 레이트 제어**: 대역폭에 따른 프레임 레이트 조정
- **비디오 압축**: H.264 코덱 최적화

### 연결 최적화
- **ICE candidate 최적화**: 효율적인 NAT 통과
- **연결 풀링**: 재사용 가능한 연결 관리
- **자동 재연결**: 연결 끊김 시 자동 복구

## 🔒 보안 고려사항

### HTTPS 필수
- **프로덕션**: SSL/TLS 인증서 필수
- **개발**: HTTP 허용 (localhost)

### 미디어 보안
- **스트림 암호화**: WebRTC 기본 암호화
- **권한 관리**: 카메라/마이크 접근 제어
- **방 보안**: 방 ID 기반 접근 제어

## 📈 확장성

### 수평 확장
- **로드 밸런서**: 여러 시그널링 서버 지원
- **Redis**: 세션 및 방 정보 공유
- **마이크로서비스**: 기능별 서비스 분리

### 수직 확장
- **동시 사용자**: 최대 8명 → 16명 확장 가능
- **화질 향상**: 4K 화질 지원
- **기능 추가**: 녹화, 스트리밍 등

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면:
1. [Issues](../../issues) 페이지에 문제 등록
2. [Discussions](../../discussions) 페이지에서 토론 참여
3. 프로젝트 문서 확인

## 🎯 로드맵

### v1.1 (예정)
- [ ] 화면 녹화 기능
- [ ] 가상 배경
- [ ] 노이즈 제거
- [ ] 자동 번역

### v1.2 (예정)
- [ ] 모바일 앱
- [ ] 데스크톱 앱
- [ ] API 문서
- [ ] SDK 제공

---

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**
