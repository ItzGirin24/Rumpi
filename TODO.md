# Sistem Call Lengkap - TODO List

## 1. Lengkapi Signaling Server
- [x] Buat server Socket.IO untuk signaling WebRTC
- [x] Implementasi room management untuk calls
- [x] Handle offer, answer, ICE candidates

## 2. Update callService.js
- [x] Perbaiki initializeSocket dengan proper room handling
- [x] Lengkapi sendSignalingMessage menggunakan Socket.IO
- [x] Update startCall dan acceptCall dengan signaling yang benar
- [x] Tambahkan error handling yang lebih baik

## 3. Update CallModal.jsx
- [x] Implementasi sendSignalingMessage yang sesungguhnya
- [x] Tambahkan event listeners untuk signaling messages
- [x] Perbaiki WebRTC connection establishment

## 4. Update IncomingCallNotification.jsx
- [x] Pastikan acceptCall dan declineCall bekerja dengan signaling
- [x] Tambahkan timeout handling

## 5. Update App.js
- [x] Perbaiki listener incoming calls
- [x] Tambahkan state management untuk active calls

## 6. Update ChatArea.jsx
- [x] Pastikan handleStartCall menginisialisasi signaling dengan benar
- [x] Tambahkan error handling untuk call initiation

## 7. Testing dan Debugging
- [x] Test audio call antara dua users
- [x] Test video call
- [x] Test call rejection dan missed calls
- [x] Test multiple calls

## 8. Dependencies
- [x] Pastikan socket.io-client terinstall
- [x] Tambahkan simple-peer jika diperlukan untuk WebRTC simplification

## 9. Server Setup
- [x] Buat signaling server dengan Socket.IO
- [x] Setup dependencies untuk server
- [x] Jalankan server signaling di port 8000

## 10. Bug Fixes
- [x] Fix audio context issues in CallModal
- [x] Fix ringing sound issues in IncomingCallNotification
- [x] Update acceptCall to use callId instead of roomId
- [x] Add getDoc import to callService.js
