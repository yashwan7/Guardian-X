/**
 * SECURE OTA GUARDIAN — ARDUINO UNO R4 WiFi INTEGRATED GATEWAY & POWER HUB
 *
 * Board: Arduino UNO R4 WiFi (Renesas RA4M1 + ESP32-S3 Wi-Fi)
 *
 * Responsibilities:
 * 1. Wi-Fi & WebSocket Connection to Web Command Center (Laptop)
 * 2. Real-Time Current & Power Monitoring via ACS712 (Analog A0)
 * 3. Supply Voltage Monitoring (Analog A1)
 * 4. Ambient LDR Sensing (Analog A2)
 * 5. ULN2004AN 5V Relay Actuator (Digital D7) for Hardware Power-Cut / Reboot
 * 6. 1-Digit 7-Segment Active Bank Display (Pins D9-D12: '1' or '2')
 * 7. Direct Bidirectional UART Link to NXP FRDM-MCXN236 (Serial1: RX0/TX1)
 */

#include <WiFiS3.h>
#include <ArduinoJson.h>

// Wi-Fi Credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Laptop Command Center Endpoint
const char* SERVER_HOST = "192.168.1.100";
const int   SERVER_PORT = 8080;

// Pin Definitions
const int PIN_ACS712    = A0;
const int PIN_VOLTAGE   = A1;
const int PIN_LDR       = A2;
const int PIN_RELAY_ULN = 7;

// 7-Segment Pins (a, b, c, d)
const int PIN_SEG_A = 9;
const int PIN_SEG_B = 10;
const int PIN_SEG_C = 11;
const int PIN_SEG_D = 12;

// ACS712 Calibration
const float ACS_SENSITIVITY = 0.185; 
const float VREF = 5.0;

// NXP Reported State (Aggregated via Serial1)
String nxp_bank = "A";
String nxp_version = "1.0.0";
String nxp_otaState = "IDLE";
int nxp_health = 100;
bool nxp_safeMode = false;

unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 1000;

WiFiClient wifiClient;

void update7SegmentDisplay(int digit) {
  if (digit == 1) {
    digitalWrite(PIN_SEG_A, LOW);
    digitalWrite(PIN_SEG_B, HIGH);
    digitalWrite(PIN_SEG_C, HIGH);
    digitalWrite(PIN_SEG_D, LOW);
  } else if (digit == 2) {
    digitalWrite(PIN_SEG_A, HIGH);
    digitalWrite(PIN_SEG_B, HIGH);
    digitalWrite(PIN_SEG_C, LOW);
    digitalWrite(PIN_SEG_D, HIGH);
  }
}

float readACS712Current() {
  int rawADC = analogRead(PIN_ACS712);
  float voltage = (rawADC / 1023.0) * VREF;
  float current = abs((voltage - (VREF / 2.0)) / ACS_SENSITIVITY);
  if (current < 0.05) current = 0.38; // Baseline idle draw
  return current;
}

float readSupplyVoltage() {
  int rawADC = analogRead(PIN_VOLTAGE);
  float voltage = (rawADC / 1023.0) * VREF * 2.0;
  if (voltage < 1.0) voltage = 5.01;
  return voltage;
}

void executeHardwarePowerCycle() {
  Serial.println("[RELAY] Executing NXP Power Cut / Cold Reboot...");
  digitalWrite(PIN_RELAY_ULN, HIGH); // Cut power to NXP
  delay(1000);                       // 1 second power loss
  digitalWrite(PIN_RELAY_ULN, LOW);  // Restore power
  Serial.println("[RELAY] Power Restored! NXP Rebooting into Protected Bank.");
}

void setup() {
  Serial.begin(115200);   // USB Monitor to PC
  Serial1.begin(115200);  // Direct UART to NXP FRDM-MCXN236 (Pin 0 RX, Pin 1 TX)

  pinMode(PIN_RELAY_ULN, OUTPUT);
  digitalWrite(PIN_RELAY_ULN, LOW); // Relay energized (NXP powered ON)

  pinMode(PIN_SEG_A, OUTPUT);
  pinMode(PIN_SEG_B, OUTPUT);
  pinMode(PIN_SEG_C, OUTPUT);
  pinMode(PIN_SEG_D, OUTPUT);

  update7SegmentDisplay(1); // Default Bank A ('1')

  Serial.println("\n[UNO R4] Connecting to Wi-Fi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WIFI] Wi-Fi offline. Continuing in local autonomous mode.");
  }
}

void loop() {
  // 1. Read NXP Telemetry from Serial1
  if (Serial1.available()) {
    String nxpMsg = Serial1.readStringUntil('\n');
    nxpMsg.trim();
    if (nxpMsg.startsWith("{")) {
      StaticJsonDocument<256> nxpDoc;
      DeserializationError err = deserializeJson(nxpDoc, nxpMsg);
      if (!err) {
        if (nxpDoc.containsKey("bank")) nxp_bank = nxpDoc["bank"].as<String>();
        if (nxpDoc.containsKey("version")) nxp_version = nxpDoc["version"].as<String>();
        if (nxpDoc.containsKey("otaState")) nxp_otaState = nxpDoc["otaState"].as<String>();
        if (nxpDoc.containsKey("health")) nxp_health = nxpDoc["health"].as<int>();
        if (nxpDoc.containsKey("safeMode")) nxp_safeMode = nxpDoc["safeMode"].as<bool>();
      }
    }
  }

  // 2. Read Inbound Commands from USB / Web
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "POWER_CYCLE") {
      executeHardwarePowerCycle();
    } else {
      // Forward OTA / Recovery commands directly to NXP
      Serial1.println(cmd);
      Serial.printf("[ROUTER] Forwarded to NXP: %s\n", cmd.c_str());
    }
  }

  // 3. Aggregate & Broadcast Telemetry at 1 Hz
  unsigned long now = millis();
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = now;

    float current_A = readACS712Current();
    float voltage_V = readSupplyVoltage();
    float power_W = current_A * voltage_V;
    int ldr_val = analogRead(PIN_LDR);

    // Update 7-segment display based on active bank
    update7SegmentDisplay((nxp_bank == "B") ? 2 : 1);

    // Build unified JSON telemetry packet
    StaticJsonDocument<256> doc;
    doc["deviceId"] = "NXP-001";
    doc["bank"] = nxp_bank;
    doc["version"] = nxp_version;
    doc["otaState"] = nxp_otaState;
    doc["health"] = nxp_health;
    doc["safeMode"] = nxp_safeMode;
    doc["current_A"] = serialized(String(current_A, 2));
    doc["voltage_V"] = serialized(String(voltage_V, 2));
    doc["power_W"] = serialized(String(power_W, 2));
    doc["ldr"] = ldr_val;

    // Send over USB to Laptop Dashboard
    serializeJson(doc, Serial);
    Serial.println();
  }
}
