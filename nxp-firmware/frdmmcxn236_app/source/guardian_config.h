#ifndef GUARDIAN_CONFIG_H
#define GUARDIAN_CONFIG_H

/* Firmware Version Configuration */
#define GUARDIAN_FW_VERSION_MAJOR 1U
#define GUARDIAN_FW_VERSION_MINOR 0U
#define GUARDIAN_FW_VERSION_PATCH 0U
#define GUARDIAN_FW_VERSION       "1.0.0"

/* --- External LEDs (Arduino Headers) --- */
#define GUARDIAN_LED_GREEN_PORT   PORT4
#define GUARDIAN_LED_GREEN_GPIO   GPIO4
#define GUARDIAN_LED_GREEN_PIN    21U   /* J3 Pin 3 (ARD A1 / P4_21) */

#define GUARDIAN_LED_YELLOW_PORT  PORT3
#define GUARDIAN_LED_YELLOW_GPIO  GPIO3
#define GUARDIAN_LED_YELLOW_PIN   17U   /* J3 Pin 5 (ARD A2 / P3_17) */

#define GUARDIAN_LED_BLUE_PORT    PORT3
#define GUARDIAN_LED_BLUE_GPIO    GPIO3
#define GUARDIAN_LED_BLUE_PIN     16U   /* J3 Pin 7 (ARD A3 / P3_16) */

/* --- Buzzer & Relay --- */
#define GUARDIAN_BUZZER_PORT      PORT4
#define GUARDIAN_BUZZER_GPIO      GPIO4
#define GUARDIAN_BUZZER_PIN       13U   /* J3 Pin 1 (ARD A0 / P4_13) */

#define GUARDIAN_RELAY_PORT       PORT4
#define GUARDIAN_RELAY_GPIO       GPIO4
#define GUARDIAN_RELAY_PIN        3U    /* J1 Pin 4 (ARD D1 / P4_3)  */
#define GUARDIAN_RELAY_ENABLED    1

/* --- Push Buttons --- */
#define GUARDIAN_BTN1_PORT        PORT2
#define GUARDIAN_BTN1_GPIO        GPIO2
#define GUARDIAN_BTN1_PIN         0U    /* J1 Pin 5 (ARD D2 / P2_0)  */

#define GUARDIAN_BTN2_PORT        PORT2
#define GUARDIAN_BTN2_GPIO        GPIO2
#define GUARDIAN_BTN2_PIN         8U    /* J1 Pin 6 (ARD D3 / P2_8)  */

/* On-board Push Buttons (SW2 & SW3) */
#define GUARDIAN_SW2_PORT         PORT0
#define GUARDIAN_SW2_GPIO         GPIO0
#define GUARDIAN_SW2_PIN          20U   /* SW2 (P0_20) */

#define GUARDIAN_SW3_PORT         PORT0
#define GUARDIAN_SW3_GPIO         GPIO0
#define GUARDIAN_SW3_PIN          6U    /* SW3 (P0_6)  */

/* --- 16x2 I2C LCD (HD44780 + PCF8574 Backpack) --- */
#define GUARDIAN_LCD_SDA_PORT     PORT4
#define GUARDIAN_LCD_SDA_GPIO     GPIO4
#define GUARDIAN_LCD_SDA_PIN      0U    /* J5 Pin 6 (P4_0 / SDA) */

#define GUARDIAN_LCD_SCL_PORT     PORT4
#define GUARDIAN_LCD_SCL_GPIO     GPIO4
#define GUARDIAN_LCD_SCL_PIN      1U    /* J5 Pin 5 (P4_1 / SCL) */

/* --- RFID RC522 EXACT WIRING --- */
/* RST -> J2 Pin 2 (P3_14 / ARD D9) */
#define GUARDIAN_RFID_RST_PORT    PORT3
#define GUARDIAN_RFID_RST_GPIO    GPIO3
#define GUARDIAN_RFID_RST_PIN     14U

/* SDA (CS / SS) -> P1_3 */
#define GUARDIAN_RFID_SDA_PORT    PORT1
#define GUARDIAN_RFID_SDA_GPIO    GPIO1
#define GUARDIAN_RFID_SDA_PIN     3U

/* SCK -> P1_1 */
#define GUARDIAN_RFID_SCK_PORT    PORT1
#define GUARDIAN_RFID_SCK_GPIO    GPIO1
#define GUARDIAN_RFID_SCK_PIN     1U

/* MOSI -> P1_0 */
#define GUARDIAN_RFID_MOSI_PORT   PORT1
#define GUARDIAN_RFID_MOSI_GPIO   GPIO1
#define GUARDIAN_RFID_MOSI_PIN    0U

/* MISO -> P1_2 */
#define GUARDIAN_RFID_MISO_PORT   PORT1
#define GUARDIAN_RFID_MISO_GPIO   GPIO1
#define GUARDIAN_RFID_MISO_PIN    2U

#endif /* GUARDIAN_CONFIG_H */
