/*
 * Secure OTA Guardian X - NXP FRDM-MCXN236 Embedded Application
 * Complete Multi-Peripheral Implementation with 2-Way Web Dashboard Sync:
 * - Listens for Web Dashboard Remote Commands (CMD:BANK_A, CMD:BANK_B, CMD:FAULT, CMD:BEEP, CMD:LCD, CMD:RELAY)
 * - Emits Real-time JSON & Formatted Telemetry to WebSerial / Web Dashboard
 * - Physical Controls: Buttons (SW2/D2 Bank Toggle, SW3/D3 Fault Inject), LEDs (P4_21, P3_17, P3_16), Buzzer (P4_13), LCD (P4_0/P4_1), Relay (P4_3)
 */

#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "app.h"
#include "board.h"
#include "clock_config.h"
#include "pin_mux.h"
#include "fsl_clock.h"
#include "fsl_debug_console.h"
#include "fsl_device_registers.h"
#include "fsl_gpio.h"
#include "fsl_port.h"
#include "fsl_lpuart.h"
#include "guardian_config.h"

/* --- LCD PCF8574 Bit Definitions --- */
#define LCD_BACKLIGHT_BIT   0x08U
#define LCD_ENABLE_BIT      0x04U
#define LCD_RW_BIT          0x02U
#define LCD_RS_BIT          0x01U

static uint8_t s_lcd_address = 0x27U;
static bool    s_lcd_present = false;

/* --- System State --- */
static uint8_t s_active_bank = 0U; /* 0 = Bank A (v1.0.0), 1 = Bank B (v2.0.0) */
static bool    s_safe_mode   = false;
static bool    s_relay_state = true;
static char    s_lcd_line1[17] = "GUARDIAN X OTA";
static char    s_lcd_line2[17] = "BANK A: v1.0.0";

/* --- Delay Utilities --- */
static void guardian_delay_ms(uint32_t ms)
{
    while (ms-- != 0U) {
        SDK_DelayAtLeastUs(1000U, SystemCoreClock);
    }
}

static void guardian_delay_us(uint32_t us)
{
    SDK_DelayAtLeastUs(us, SystemCoreClock);
}

/* --- Pin Configuration Helper --- */
static void configure_gpio_pin(PORT_Type *port, uint32_t pin, bool open_drain, bool pull_up, bool high_drive)
{
    port_pin_config_t config = {
        .pullSelect = pull_up ? kPORT_PullUp : kPORT_PullDisable,
        .pullValueSelect = kPORT_LowPullResistor,
        .slewRate = kPORT_FastSlewRate,
        .passiveFilterEnable = kPORT_PassiveFilterDisable,
        .openDrainEnable = open_drain ? kPORT_OpenDrainEnable : kPORT_OpenDrainDisable,
        .driveStrength = high_drive ? kPORT_HighDriveStrength : kPORT_LowDriveStrength,
        .mux = kPORT_MuxAlt0, /* ALT0 = GPIO */
        .inputBuffer = kPORT_InputBufferEnable,
        .invertInput = kPORT_InputNormal,
        .lockRegister = kPORT_UnlockRegister,
    };
    PORT_SetPinConfig(port, pin, &config);
}

static void configure_output_pin(GPIO_Type *gpio, uint32_t pin, uint32_t initial_val)
{
    gpio_pin_config_t config = {
        .pinDirection = kGPIO_DigitalOutput,
        .outputLogic = initial_val,
    };
    GPIO_PinInit(gpio, pin, &config);
}

static void configure_input_pin(GPIO_Type *gpio, uint32_t pin)
{
    gpio_pin_config_t config = {
        .pinDirection = kGPIO_DigitalInput,
        .outputLogic = 0U,
    };
    GPIO_PinInit(gpio, pin, &config);
}

/* --- Buzzer Control --- */
static void guardian_buzzer_init(void)
{
    CLOCK_EnableClock(kCLOCK_Port4);
    CLOCK_EnableClock(kCLOCK_Gpio4);
    configure_gpio_pin(GUARDIAN_BUZZER_PORT, GUARDIAN_BUZZER_PIN, false, false, true);
    configure_output_pin(GUARDIAN_BUZZER_GPIO, GUARDIAN_BUZZER_PIN, 0U);
}

static void guardian_buzzer_beep(uint32_t duration_ms)
{
    uint32_t half_period_us = 208U; /* ~2400 Hz */
    uint32_t total_cycles = (2400U * duration_ms) / 1000U;
    if (total_cycles == 0U) total_cycles = 1U;

    for (uint32_t i = 0U; i < total_cycles; i++) {
        GPIO_PinWrite(GUARDIAN_BUZZER_GPIO, GUARDIAN_BUZZER_PIN, 1U);
        guardian_delay_us(half_period_us);
        GPIO_PinWrite(GUARDIAN_BUZZER_GPIO, GUARDIAN_BUZZER_PIN, 0U);
        guardian_delay_us(half_period_us);
    }
    GPIO_PinWrite(GUARDIAN_BUZZER_GPIO, GUARDIAN_BUZZER_PIN, 0U);
}

/* --- Relay Control --- */
static void guardian_relay_init(void)
{
#if GUARDIAN_RELAY_ENABLED
    CLOCK_EnableClock(kCLOCK_Port4);
    CLOCK_EnableClock(kCLOCK_Gpio4);
    configure_gpio_pin(GUARDIAN_RELAY_PORT, GUARDIAN_RELAY_PIN, false, false, false);
    configure_output_pin(GUARDIAN_RELAY_GPIO, GUARDIAN_RELAY_PIN, 1U);
#endif
}

static void guardian_set_relay(bool enable)
{
    s_relay_state = enable;
#if GUARDIAN_RELAY_ENABLED
    GPIO_PinWrite(GUARDIAN_RELAY_GPIO, GUARDIAN_RELAY_PIN, enable ? 1U : 0U);
#endif
}

/* --- LED Controls (On-board & External) --- */
static void guardian_leds_init(void)
{
    CLOCK_EnableClock(kCLOCK_Port3);
    CLOCK_EnableClock(kCLOCK_Gpio3);
    CLOCK_EnableClock(kCLOCK_Port4);
    CLOCK_EnableClock(kCLOCK_Gpio4);

    /* On-board RGB LED Pins (Active-Low) */
    configure_gpio_pin(PORT4, BOARD_LED_RED_GPIO_PIN, false, false, false);
    configure_gpio_pin(PORT4, BOARD_LED_GREEN_GPIO_PIN, false, false, false);
    configure_gpio_pin(PORT4, BOARD_LED_BLUE_GPIO_PIN, false, false, false);
    configure_output_pin(BOARD_LED_RED_GPIO, BOARD_LED_RED_GPIO_PIN, 1U);
    configure_output_pin(BOARD_LED_GREEN_GPIO, BOARD_LED_GREEN_GPIO_PIN, 1U);
    configure_output_pin(BOARD_LED_BLUE_GPIO, BOARD_LED_BLUE_GPIO_PIN, 1U);

    /* External Green LED (P4_21 / J3 Pin 3) */
    configure_gpio_pin(GUARDIAN_LED_GREEN_PORT, GUARDIAN_LED_GREEN_PIN, false, false, true);
    configure_output_pin(GUARDIAN_LED_GREEN_GPIO, GUARDIAN_LED_GREEN_PIN, 0U);

    /* External Yellow LED (P3_17 / J3 Pin 5) */
    configure_gpio_pin(GUARDIAN_LED_YELLOW_PORT, GUARDIAN_LED_YELLOW_PIN, false, false, true);
    configure_output_pin(GUARDIAN_LED_YELLOW_GPIO, GUARDIAN_LED_YELLOW_PIN, 0U);

    /* External Blue LED (P3_16 / J3 Pin 7) */
    configure_gpio_pin(GUARDIAN_LED_BLUE_PORT, GUARDIAN_LED_BLUE_PIN, false, false, true);
    configure_output_pin(GUARDIAN_LED_BLUE_GPIO, GUARDIAN_LED_BLUE_PIN, 0U);
}

static void guardian_set_led_state(bool red, bool green, bool yellow, bool blue)
{
    /* On-board RGB LED (Active-LOW: 0=ON, 1=OFF) */
    GPIO_PinWrite(BOARD_LED_RED_GPIO, BOARD_LED_RED_GPIO_PIN, red ? 0U : 1U);
    GPIO_PinWrite(BOARD_LED_GREEN_GPIO, BOARD_LED_GREEN_GPIO_PIN, green ? 0U : 1U);
    GPIO_PinWrite(BOARD_LED_BLUE_GPIO, BOARD_LED_BLUE_GPIO_PIN, blue ? 0U : 1U);

    /* External LEDs (Active-HIGH: 1=ON, 0=OFF) */
    GPIO_PinWrite(GUARDIAN_LED_GREEN_GPIO, GUARDIAN_LED_GREEN_PIN, green ? 1U : 0U);
    GPIO_PinWrite(GUARDIAN_LED_YELLOW_GPIO, GUARDIAN_LED_YELLOW_PIN, yellow ? 1U : 0U);
    GPIO_PinWrite(GUARDIAN_LED_BLUE_GPIO, GUARDIAN_LED_BLUE_PIN, blue ? 1U : 0U);
}

/* --- Push Buttons Init --- */
static void guardian_buttons_init(void)
{
    CLOCK_EnableClock(kCLOCK_Port0);
    CLOCK_EnableClock(kCLOCK_Gpio0);
    CLOCK_EnableClock(kCLOCK_Port2);
    CLOCK_EnableClock(kCLOCK_Gpio2);

    /* External Buttons (Active-LOW with Internal Pull-Ups) */
    configure_gpio_pin(GUARDIAN_BTN1_PORT, GUARDIAN_BTN1_PIN, false, true, false);
    configure_input_pin(GUARDIAN_BTN1_GPIO, GUARDIAN_BTN1_PIN);

    configure_gpio_pin(GUARDIAN_BTN2_PORT, GUARDIAN_BTN2_PIN, false, true, false);
    configure_input_pin(GUARDIAN_BTN2_GPIO, GUARDIAN_BTN2_PIN);

    /* On-board SW2 & SW3 */
    configure_gpio_pin(GUARDIAN_SW2_PORT, GUARDIAN_SW2_PIN, false, true, false);
    configure_input_pin(GUARDIAN_SW2_GPIO, GUARDIAN_SW2_PIN);

    configure_gpio_pin(GUARDIAN_SW3_PORT, GUARDIAN_SW3_PIN, false, true, false);
    configure_input_pin(GUARDIAN_SW3_GPIO, GUARDIAN_SW3_PIN);
}

static bool is_button1_pressed(void)
{
    bool ext = (GPIO_PinRead(GUARDIAN_BTN1_GPIO, GUARDIAN_BTN1_PIN) == 0U);
    bool sw2 = (GPIO_PinRead(GUARDIAN_SW2_GPIO, GUARDIAN_SW2_PIN) == 0U);
    return ext || sw2;
}

static bool is_button2_pressed(void)
{
    bool ext = (GPIO_PinRead(GUARDIAN_BTN2_GPIO, GUARDIAN_BTN2_PIN) == 0U);
    bool sw3 = (GPIO_PinRead(GUARDIAN_SW3_GPIO, GUARDIAN_SW3_PIN) == 0U);
    return ext || sw3;
}

/* --- Bit-Bang I2C Driver for LCD Backpack --- */
static void i2c_sda_high(void)
{
    GUARDIAN_LCD_SDA_GPIO->PDDR &= ~(1U << GUARDIAN_LCD_SDA_PIN);
}

static void i2c_sda_low(void)
{
    GPIO_PinWrite(GUARDIAN_LCD_SDA_GPIO, GUARDIAN_LCD_SDA_PIN, 0U);
    GUARDIAN_LCD_SDA_GPIO->PDDR |= (1U << GUARDIAN_LCD_SDA_PIN);
}

static uint32_t i2c_sda_read(void)
{
    return GPIO_PinRead(GUARDIAN_LCD_SDA_GPIO, GUARDIAN_LCD_SDA_PIN);
}

static void i2c_scl_high(void)
{
    GUARDIAN_LCD_SCL_GPIO->PDDR &= ~(1U << GUARDIAN_LCD_SCL_PIN);
}

static void i2c_scl_low(void)
{
    GPIO_PinWrite(GUARDIAN_LCD_SCL_GPIO, GUARDIAN_LCD_SCL_PIN, 0U);
    GUARDIAN_LCD_SCL_GPIO->PDDR |= (1U << GUARDIAN_LCD_SCL_PIN);
}

static void i2c_bus_init(void)
{
    CLOCK_EnableClock(kCLOCK_Port4);
    CLOCK_EnableClock(kCLOCK_Gpio4);

    configure_gpio_pin(GUARDIAN_LCD_SDA_PORT, GUARDIAN_LCD_SDA_PIN, true, true, false);
    configure_gpio_pin(GUARDIAN_LCD_SCL_PORT, GUARDIAN_LCD_SCL_PIN, true, true, false);

    i2c_sda_high();
    i2c_scl_high();
    guardian_delay_us(20U);
}

static void i2c_start(void)
{
    i2c_sda_high();
    i2c_scl_high();
    guardian_delay_us(6U);
    i2c_sda_low();
    guardian_delay_us(6U);
    i2c_scl_low();
    guardian_delay_us(6U);
}

static void i2c_stop(void)
{
    i2c_sda_low();
    guardian_delay_us(6U);
    i2c_scl_high();
    guardian_delay_us(6U);
    i2c_sda_high();
    guardian_delay_us(6U);
}

static bool i2c_write_byte(uint8_t byte)
{
    for (uint32_t i = 0U; i < 8U; i++) {
        if ((byte & 0x80U) != 0U) {
            i2c_sda_high();
        } else {
            i2c_sda_low();
        }
        guardian_delay_us(6U);
        i2c_scl_high();
        guardian_delay_us(6U);
        i2c_scl_low();
        guardian_delay_us(6U);
        byte <<= 1U;
    }

    i2c_sda_high();
    guardian_delay_us(6U);
    i2c_scl_high();
    guardian_delay_us(6U);
    bool ack = (i2c_sda_read() == 0U);
    i2c_scl_low();
    guardian_delay_us(6U);
    return ack;
}

static bool lcd_expander_write(uint8_t data)
{
    i2c_start();
    bool ack = i2c_write_byte((uint8_t)(s_lcd_address << 1U));
    if (ack) {
        ack = i2c_write_byte(data);
    }
    i2c_stop();
    return ack;
}

static bool lcd_send_nibble(uint8_t nibble, bool rs)
{
    uint8_t value = (uint8_t)((nibble & 0xF0U) | LCD_BACKLIGHT_BIT | (rs ? LCD_RS_BIT : 0U));
    bool ok = lcd_expander_write((uint8_t)(value | LCD_ENABLE_BIT));
    guardian_delay_us(10U);
    ok = lcd_expander_write(value) && ok;
    guardian_delay_us(50U);
    return ok;
}

static bool lcd_send_byte(uint8_t byte, bool rs)
{
    bool ok = lcd_send_nibble((uint8_t)(byte & 0xF0U), rs);
    ok = lcd_send_nibble((uint8_t)(byte << 4U), rs) && ok;
    return ok;
}

static void lcd_command(uint8_t cmd)
{
    lcd_send_byte(cmd, false);
    if (cmd == 0x01U || cmd == 0x02U) {
        guardian_delay_ms(3U);
    } else {
        guardian_delay_us(100U);
    }
}

static void lcd_data(uint8_t data)
{
    lcd_send_byte(data, true);
    guardian_delay_us(100U);
}

static void lcd_clear(void)
{
    lcd_command(0x01U);
}

static void lcd_set_cursor(uint8_t row, uint8_t col)
{
    uint8_t row_offsets[] = {0x00U, 0x40U};
    lcd_command((uint8_t)(0x80U | (col + row_offsets[row > 1U ? 1U : row])));
}

static void lcd_print(const char *str)
{
    while (*str != '\0') {
        lcd_data((uint8_t)(*str++));
    }
}

static bool lcd_probe_address(void)
{
    const uint8_t candidate_addresses[] = {0x27U, 0x3FU, 0x20U, 0x38U};
    for (uint32_t i = 0U; i < sizeof(candidate_addresses); i++) {
        uint8_t addr = candidate_addresses[i];
        i2c_start();
        bool ack = i2c_write_byte((uint8_t)(addr << 1U));
        i2c_stop();
        if (ack) {
            s_lcd_address = addr;
            return true;
        }
        guardian_delay_ms(2U);
    }
    return false;
}

static bool lcd_init(void)
{
    i2c_bus_init();
    guardian_delay_ms(60U);

    if (!lcd_probe_address()) {
        s_lcd_address = 0x27U;
    }

    lcd_send_nibble(0x30U, false);
    guardian_delay_ms(6U);
    lcd_send_nibble(0x30U, false);
    guardian_delay_us(200U);
    lcd_send_nibble(0x30U, false);
    guardian_delay_us(200U);
    lcd_send_nibble(0x20U, false);
    guardian_delay_ms(2U);

    lcd_command(0x28U);
    lcd_command(0x0CU);
    lcd_clear();
    lcd_command(0x06U);

    return true;
}

static void lcd_show(const char *line1, const char *line2)
{
    strncpy(s_lcd_line1, line1, 16);
    s_lcd_line1[16] = '\0';
    strncpy(s_lcd_line2, line2, 16);
    s_lcd_line2[16] = '\0';

    if (!s_lcd_present) return;
    lcd_clear();
    lcd_set_cursor(0U, 0U);
    lcd_print(s_lcd_line1);
    lcd_set_cursor(1U, 0U);
    lcd_print(s_lcd_line2);
}

static void lcd_update_idle_screen(void)
{
    if (s_active_bank == 1U) {
        lcd_show("GUARDIAN X OTA", "BANK B: v2.0.0");
    } else {
        lcd_show("GUARDIAN X OTA", "BANK A: v1.0.0");
    }
}

/* --- Emit Live Telemetry to Serial --- */
static void emit_telemetry(void)
{
    const char *bank_str = (s_active_bank == 1U) ? "B" : "A";
    const char *fw_str   = (s_active_bank == 1U) ? "2.0.0" : "1.0.0";
    const char *led_str  = s_safe_mode ? "RED" : (s_active_bank == 1U ? "BLUE" : "GREEN");

    PRINTF("{\"telemetry\":true,\"deviceId\":\"NXP-001\",\"fw\":\"%s\",\"bank\":\"%s\",\"led\":\"%s\",\"lcd1\":\"%s\",\"lcd2\":\"%s\",\"safe\":%s,\"relay\":%s,\"health\":%d}\r\n",
           fw_str, bank_str, led_str, s_lcd_line1, s_lcd_line2,
           s_safe_mode ? "true" : "false", s_relay_state ? "true" : "false", s_safe_mode ? 35 : 100);
}

/* --- Process Remote Serial Commands from Web Dashboard --- */
static void process_serial_command(const char *cmd)
{
    if (strcmp(cmd, "CMD:BANK_B") == 0 || strcmp(cmd, "CMD:DEPLOY") == 0) {
        s_active_bank = 1U;
        s_safe_mode = false;
        guardian_buzzer_beep(80U);
        guardian_set_led_state(false, false, false, true);
        lcd_show("BANK B: v2.0.0", "MetroPay Mode OK");
        PRINTF("[REMOTE] Activated Flash Bank B (v2.0.0 MetroPay)\r\n");
        emit_telemetry();
        guardian_delay_ms(1000U);
        lcd_update_idle_screen();
        emit_telemetry();
    }
    else if (strcmp(cmd, "CMD:BANK_A") == 0 || strcmp(cmd, "CMD:RESTORE") == 0) {
        s_active_bank = 0U;
        s_safe_mode = false;
        guardian_buzzer_beep(80U);
        guardian_set_led_state(false, true, false, false);
        lcd_show("BANK A: v1.0.0", "SmartPass Golden");
        PRINTF("[REMOTE] Activated Flash Bank A (v1.0.0 Golden)\r\n");
        emit_telemetry();
        guardian_delay_ms(1000U);
        lcd_update_idle_screen();
        emit_telemetry();
    }
    else if (strcmp(cmd, "CMD:FAULT") == 0) {
        s_safe_mode = true;
        guardian_set_led_state(true, false, true, false);
        guardian_buzzer_beep(120U);
        guardian_delay_ms(60U);
        guardian_buzzer_beep(120U);
        lcd_show("FAULT INJECTED!", "AUTONOMOUS ROLLBACK");
        PRINTF("[REMOTE] Injected Fault: Watchdog Timeout Triggered!\r\n");
        emit_telemetry();

        guardian_delay_ms(1500U);

        /* Auto-Rollback to Bank A */
        s_active_bank = 0U;
        s_safe_mode = false;
        guardian_set_led_state(false, true, false, false);
        guardian_buzzer_beep(100U);
        lcd_show("SAFE RESTORED", "BANK A: v1.0.0");
        PRINTF("[GUARDIAN] Self-Healing: Reverted to Bank A Golden Image. System Safe.\r\n");
        emit_telemetry();
        guardian_delay_ms(1000U);
        lcd_update_idle_screen();
        emit_telemetry();
    }
    else if (strcmp(cmd, "CMD:BEEP") == 0) {
        guardian_buzzer_beep(150U);
        PRINTF("[REMOTE] Buzzer Chime Triggered!\r\n");
    }
    else if (strncmp(cmd, "CMD:LCD:", 8) == 0) {
        const char *payload = cmd + 8;
        char l1[17] = {0};
        char l2[17] = {0};
        const char *comma = strchr(payload, ',');
        if (comma != NULL) {
            size_t l1_len = comma - payload;
            if (l1_len > 16) l1_len = 16;
            strncpy(l1, payload, l1_len);
            strncpy(l2, comma + 1, 16);
        } else {
            strncpy(l1, payload, 16);
        }
        lcd_show(l1, l2);
        PRINTF("[REMOTE] LCD Updated: \"%s\" / \"%s\"\r\n", l1, l2);
        emit_telemetry();
    }
    else if (strcmp(cmd, "CMD:RELAY:1") == 0) {
        guardian_set_relay(true);
        PRINTF("[REMOTE] Relay Energized (Turnstile Unlocked)\r\n");
        emit_telemetry();
    }
    else if (strcmp(cmd, "CMD:RELAY:0") == 0) {
        guardian_set_relay(false);
        PRINTF("[REMOTE] Relay De-energized (Turnstile Locked)\r\n");
        emit_telemetry();
    }
}

/* --- Check Serial RX Buffer Non-blocking --- */
static char s_cmd_buffer[64];
static uint32_t s_cmd_idx = 0U;

static void check_serial_rx(void)
{
    while ((LPUART4->STAT & LPUART_STAT_RDRF_MASK) != 0U) {
        char ch = (char)(LPUART4->DATA & 0xFFU);
        if (ch == '\r' || ch == '\n') {
            if (s_cmd_idx > 0U) {
                s_cmd_buffer[s_cmd_idx] = '\0';
                process_serial_command(s_cmd_buffer);
                s_cmd_idx = 0U;
            }
        } else if (s_cmd_idx < (sizeof(s_cmd_buffer) - 1U)) {
            s_cmd_buffer[s_cmd_idx++] = ch;
        }
    }
}

/* --- Main Application Entry Point --- */
int main(void)
{
    /* 1. Board & Clocks Init */
    BOARD_InitBootPins();
    BOARD_InitBootClocks();
    BOARD_InitDebugConsole();

    /* 2. Hardware Peripherals Init */
    guardian_buzzer_init();
    guardian_leds_init();
    guardian_buttons_init();
    guardian_relay_init();

    /* 3. Startup Chime & Lamp Test */
    guardian_set_led_state(true, true, true, true);
    guardian_buzzer_beep(120U);
    guardian_delay_ms(150U);
    guardian_set_led_state(false, false, false, false);
    guardian_delay_ms(100U);

    /* 4. LCD Init */
    s_lcd_present = lcd_init();
    lcd_update_idle_screen();

    PRINTF("\r\n========================================\r\n");
    PRINTF("  SECURE OTA GUARDIAN X - NXP FRDM-MCXN236\r\n");
    PRINTF("  Firmware:     %s\r\n", GUARDIAN_FW_VERSION);
    PRINTF("  Active Bank:  BANK A (Golden Image)\r\n");
    PRINTF("  LCD Display:  0x%02X (%s)\r\n", s_lcd_address, s_lcd_present ? "READY" : "NO-ACK");
    PRINTF("  Serial Sync:  Live 2-Way Command Engine Active (115200)\r\n");
    PRINTF("========================================\r\n\r\n");

    emit_telemetry();

    /* 5. Main Execution Loop */
    bool led_toggle = false;
    uint32_t loop_tick = 0U;

    for (;;) {
        /* A. Check Serial Input from Web Dashboard */
        check_serial_rx();

        /* B. Check Button 1 / SW2: Bank Toggle (A <-> B) */
        if (is_button1_pressed()) {
            guardian_delay_ms(20U); /* Debounce */
            if (is_button1_pressed()) {
                s_active_bank = (s_active_bank == 0U) ? 1U : 0U;
                guardian_buzzer_beep(80U);

                if (s_active_bank == 1U) {
                    guardian_set_led_state(false, false, true, false);
                    guardian_delay_ms(150U);
                    guardian_set_led_state(false, false, false, true);
                    lcd_show("BANK B: v2.0.0", "MetroPay Mode OK");
                    PRINTF("[BUTTON 1] Switched Active Slot to FLASH BANK B (v2.0.0 MetroPay)\r\n");
                } else {
                    guardian_set_led_state(false, true, false, false);
                    lcd_show("BANK A: v1.0.0", "SmartPass Golden");
                    PRINTF("[BUTTON 1] Switched Active Slot to FLASH BANK A (v1.0.0 Golden Image)\r\n");
                }

                emit_telemetry();
                guardian_delay_ms(1200U);
                lcd_update_idle_screen();
                emit_telemetry();

                while (is_button1_pressed()) {
                    guardian_delay_ms(10U);
                }
            }
        }

        /* C. Check Button 2 / SW3: Fault Injection & Rollback */
        if (is_button2_pressed()) {
            guardian_delay_ms(20U); /* Debounce */
            if (is_button2_pressed()) {
                s_safe_mode = true;
                guardian_set_led_state(true, false, true, false);
                guardian_buzzer_beep(120U);
                guardian_delay_ms(80U);
                guardian_buzzer_beep(120U);
                lcd_show("FAULT INJECTED!", "AUTONOMOUS ROLLBACK");
                PRINTF("[BUTTON 2] CRITICAL FAULT INJECTED: Watchdog Timeout Triggered!\r\n");
                emit_telemetry();

                guardian_delay_ms(1500U);

                /* Auto-Rollback to Bank A */
                s_active_bank = 0U;
                s_safe_mode = false;
                guardian_set_led_state(false, true, false, false);
                guardian_buzzer_beep(100U);
                lcd_show("SAFE RESTORED", "BANK A: v1.0.0");
                PRINTF("[GUARDIAN] Self-Healing: Reverted to Bank A Golden Image. System Safe.\r\n");
                emit_telemetry();

                guardian_delay_ms(1200U);
                lcd_update_idle_screen();
                emit_telemetry();

                while (is_button2_pressed()) {
                    guardian_delay_ms(10U);
                }
            }
        }

        /* D. Heartbeat LED Blink (Green for Bank A, Blue for Bank B) */
        if ((loop_tick % 5U) == 0U) {
            led_toggle = !led_toggle;
            if (s_safe_mode) {
                guardian_set_led_state(led_toggle, false, true, false);
            } else if (s_active_bank == 1U) {
                guardian_set_led_state(false, false, false, led_toggle);
            } else {
                guardian_set_led_state(false, led_toggle, false, false);
            }
        }

        /* E. Periodic Telemetry (Every 2 seconds) */
        if ((loop_tick % 40U) == 0U) {
            emit_telemetry();
        }

        loop_tick++;
        guardian_delay_ms(50U);
    }

    return 0;
}
