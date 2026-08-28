#ifndef GPIO_CONTROL_H_
#define GPIO_CONTROL_H_

#include "ota_guardian_state_machine.h"
#include <stdint.h>
#include <stdbool.h>

/**
 * COMPLETE HARDWARE PIN & HEADER MAPPING (NXP FRDM-MCXN236)
 *
 * 1. 16x2 I2C LCD DISPLAY & INA219 CURRENT SENSOR (Shared I2C Bus):
 *    - I2C_SDA: Header J2 Pin 17 / D14 / J8 Pin 4 -> P4_0 (LCD: 0x27, INA219: 0x40)
 *    - I2C_SCL: Header J2 Pin 19 / D15 / J8 Pin 3 -> P4_1
 *    - LCD VCC: Header J4 Pin 5 -> 5V (5V required for LCD backlight)
 *    - INA219 VCC: Header J4 Pin 4 -> 3.3V
 *
 * 2. 5V RELAY MODULE (Power Switch / Gate Lock):
 *    - Relay IN:  Header J1 Pin 3 -> P4_3 (D1)
 *    - Relay VCC: Header J4 Pin 5 -> 5V
 *    - Relay GND: Header J4 Pin 6 -> GND
 *
 * 3. PUSH BUTTONS (Tactile Buttons with internal pull-ups):
 *    - Button 1 (Trigger OTA Upgrade): Header J1 Pin 1 -> P4_2 (D0) to GND
 *    - Button 2 (Inject Watchdog Fault): Header J3 Pin 11 -> P4_1 (A5) to GND
 *
 * 4. TRI-COLOR STATUS LEDs (with 220Ω to GND):
 *    - Green LED (+):  Header J3 Pin 3 -> P4_21 (A1) [Bank A Healthy]
 *    - Yellow LED (+): Header J3 Pin 5 -> P3_17 (A2) [OTA Staging/Verifying]
 *    - Blue LED (+):   Header J3 Pin 7 -> P3_16 (A3) [Bank B Active MetroPay]
 *
 * 5. BUZZER (Audio Feedback):
 *    - Buzzer (+):     Header J3 Pin 1 -> P4_13 (A0)
 *    - Buzzer (-):     Header J4 Pin 6 -> GND
 *
 * 6. 7-SEGMENT LED DISPLAY (Active Bank A/B Display):
 *    - Seg A: Header J1 Pin 5  -> P1_4 (D2)
 *    - Seg B: Header J1 Pin 7  -> P1_5 (D3)
 *    - Seg C: Header J1 Pin 9  -> P1_6 (D4)
 *    - Seg D: Header J1 Pin 11 -> P1_7 (D5)
 *    - Seg E: Header J1 Pin 13 -> P1_8 (D6)
 *    - Seg F: Header J1 Pin 15 -> P1_9 (D7)
 *    - Seg G: Header J2 Pin 1  -> P1_0 (D8)
 *    - COM:   Common GND (Cathode)
 *
 * 7. RC522 RFID MODULE (SPI Interface):
 *    - VCC:      Header J4 Pin 4 -> 3.3V (Strictly 3.3V!)
 *    - GND:      Header J4 Pin 7 -> GND
 *    - RST:      Header J2 Pin 3 -> P1_1 (D9)
 *    - SDA (CS): Header J2 Pin 5 -> P0_27 (D10)
 *    - MOSI:     Header J2 Pin 7 -> P0_26 (D11)
 *    - MISO:     Header J2 Pin 9 -> P0_25 (D12)
 *    - SCK:      Header J2 Pin 11 -> P0_24 (D13)
 */

#define PIN_RELAY_PORT           4
#define PIN_RELAY_PIN            3   /* P4_3 (D1) */

#define PIN_BTN_OTA_PORT         4
#define PIN_BTN_OTA_PIN          2   /* P4_2 (D0) */

#define PIN_BTN_FAULT_PORT       4
#define PIN_BTN_FAULT_PIN        1   /* P4_1 (A5) */

#define PIN_LED_GREEN_PIN        21  /* P4_21 (A1) */
#define PIN_LED_YELLOW_PIN       17  /* P3_17 (A2) */
#define PIN_LED_BLUE_PIN         16  /* P3_16 (A3) */
#define PIN_BUZZER_PIN           13  /* P4_13 (A0) */

void GPIO_Init_Peripherals(void);
void GPIO_Update_LEDs(ota_led_mode_t mode);
void GPIO_Update_SevenSegment(char display_char);
void GPIO_Trigger_Buzzer(uint32_t duration_ms, uint8_t beeps);
void GPIO_Set_Relay(bool energize);
bool GPIO_Read_TriggerOTA_Button(void);
bool GPIO_Read_InjectFault_Button(void);

#endif /* GPIO_CONTROL_H_ */
