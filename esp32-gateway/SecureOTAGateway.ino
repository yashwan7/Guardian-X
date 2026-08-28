/**
 * SECURE OTA GUARDIAN — ESP32 EDGE WI-FI GATEWAY & COMMAND ROUTER
 *
 * Board: ESP32 Dev Module
 * Features:
 * - High-speed Wi-Fi Connection
 * - WebSocket Client to Spring Boot 3.2 / Next.js Web Command Center
 * - Bi-directional UART Bridge to NXP FRDM-MCXN236 (Hardware Serial 2)
 * - Bi-directional UART Bridge to Arduino UNO R4 WiFi (Software/Hardware Serial)
 * - Dynamic Command Router:
 *     DEPLOY_OTA      -> Forwards to NXP
 *     INJECT_FAULT    -> Forwards to NXP
 *     POWER_CYCLE     -> Forwards to Arduino Relay
 *     APPROVE_RECOVERY-> Forwards to NXP
 * - Heartbeat & Automatic Reconnection Engine
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// Wi-Fi Credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Spring Boot / Next.js WebSocket Endpoint
const char* WS_HOST = "192.168.1.100"; // Laptop IP Running Spring Boot Backend
const int   WS_PORT = 8080;
const char* WS_PATH = "/ws/telemetry";

WebSocketsClient webSocket;
HardwareSerial NxpSerial(2); // UART2: RX2=GPIO16, TX2=GPIO17

unsigned long lastHeartbeatTime = 0;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected from Command Center Backend");
      break;
    case WStype_CONNECTED:
      Serial.printf("[WS] Connected to Web Command Center at %s:%d%s\n", WS_HOST, WS_PORT, WS_PATH);
      // Register device gateway
      webSocket.sendTXT("{\"type\":\"REGISTER_GATEWAY\",\"gatewayId\":\"ESP32-GW-01\"}");
      break;
    case WStype_TEXT: {
      Serial.printf("[WS] Inbound Command: %s\n", payload);
      StaticJsonDocument<256> cmdDoc;
      DeserializationError error = deserializeJson(cmdDoc, payload);
      if (!error) {
        const char* action = cmdDoc["action"];
        if (action) {
          if (strcmp(action, "POWER_CYCLE") == 0) {
            // Forward to Arduino Relay Driver
            Serial.println("[ROUTER] Routing POWER_CYCLE to Arduino UNO R4...");
            Serial1.println("POWER_CYCLE");
          } else {
            // Forward OTA and recovery commands to NXP board
            Serial.printf("[ROUTER] Routing %s to NXP FRDM-MCXN236...\n", action);
            NxpSerial.println(action);
          }
        }
      }
      break;
    }
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);   // USB Monitor
  Serial1.begin(115200, SERIAL_8N1, 4, 5);    // Link to Arduino (RX=4, TX=5)
  NxpSerial.begin(115200, SERIAL_8N1, 16, 17); // Link to NXP (RX=16, TX=17)

  Serial.println("\n[GATEWAY] Starting ESP32 Secure Edge OTA Gateway...");

  // 1. Connect Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WIFI] Wi-Fi connection timeout. Retrying in background...");
  }

  // 2. Initialize WebSocket Client
  webSocket.begin(WS_HOST, WS_PORT, WS_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(3000);
}

void loop() {
  webSocket.loop();

  // 1. Ingest unified telemetry packet from Arduino / NXP and forward to Web Dashboard
  if (Serial1.available()) {
    String telemetryPacket = Serial1.readStringUntil('\n');
    telemetryPacket.trim();
    if (telemetryPacket.length() > 10 && telemetryPacket.startsWith("{")) {
      // Forward live packet to WebSocket Server
      webSocket.sendTXT(telemetryPacket);
      Serial.println("[TELEMETRY FORWARD] -> " + telemetryPacket);
    }
  }

  // 2. Gateway Heartbeat
  unsigned long now = millis();
  if (now - lastHeartbeatTime >= 5000) {
    lastHeartbeatTime = now;
    if (webSocket.isConnected()) {
      webSocket.sendTXT("{\"type\":\"HEARTBEAT\",\"uptime\":" + String(millis() / 1000) + "}");
    }
  }
}
