#include "gpio_control.h"
#include <stdio.h>

void GPIO_Init_Peripherals(void) {
    printf("[GPIO] NXP FRDM-MCXN236 Complete Hardware Suite Initialized:\n");
    printf("       - 16x2 LCD (I2C): P4_0 (SDA), P4_1 (SCL)\n");
    printf("       - Relay Module: P4_3 (D1)\n");
    printf("       - Button 1 (Trigger OTA): P4_2 (D0)\n");
    printf("       - Button 2 (Inject Fault): P4_1 (A5)\n");
    printf("       - Green LED: P4_21 (A1)\n");
    printf("       - Yellow LED: P3_17 (A2)\n");
    printf("       - Blue LED: P3_16 (A3)\n");
    printf("       - Buzzer: P4_13 (A0)\n");
    printf("       - 7-Segment Bank Indicator: P1_4 to P1_0 (D2-D8)\n");
    printf("       - RC522 SPI: P0_24-27 (D10-D13)\n");
}

void GPIO_Update_LEDs(ota_led_mode_t mode) {
    switch (mode) {
        case LED_MODE_BANK_A_HEALTHY:
            printf("[LED STATUS] 🟢 GREEN ON | Yellow OFF | Blue OFF (Bank A Healthy v1.0.0)\n");
            GPIO_Update_SevenSegment('A');
            GPIO_Set_Relay(true);
            break;
        case LED_MODE_OTA_VERIFYING:
            printf("[LED STATUS] 🟡 YELLOW BLINK (OTA Staging & Verifying to Bank B)\n");
            GPIO_Update_SevenSegment('d');
            break;
        case LED_MODE_BANK_B_ACTIVE:
            printf("[LED STATUS] 🔵 BLUE ON | Green OFF | Yellow OFF (Bank B Active MetroPay v2.0.0)\n");
            GPIO_Update_SevenSegment('b');
            GPIO_Set_Relay(true);
            break;
        case LED_MODE_ROLLBACK_ALARM:
        case LED_MODE_SAFE_MODE_RESTRICTED:
            printf("[LED STATUS] ⚠️ ROLLBACK / SAFE OPERATIONAL MODE ENGAGED (Restored Bank A)\n");
            GPIO_Update_SevenSegment('E');
            GPIO_Set_Relay(false);
            break;
        default:
            break;
    }
}

void GPIO_Update_SevenSegment(char display_char) {
    printf("[7-SEGMENT] Display updated: '%c' (Bank %c Slot Active)\n", display_char, display_char);
}

void GPIO_Trigger_Buzzer(uint32_t duration_ms, uint8_t beeps) {
    printf("[BUZZER P4_13] Sounding %u beep(s) of %u ms\n", beeps, duration_ms);
}

void GPIO_Set_Relay(bool energize) {
    printf("[RELAY P4_3] Gate Lock / Power Relay: %s\n", energize ? "⚡ ENERGIZED (Turnstile Open)" : "🔒 ISOLATED (Closed)");
}

bool GPIO_Read_TriggerOTA_Button(void) {
    return false;
}

bool GPIO_Read_InjectFault_Button(void) {
    return false;
}
