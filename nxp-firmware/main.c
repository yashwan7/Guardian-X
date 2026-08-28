/**
 * SECURE OTA GUARDIAN — NXP FRDM-MCXN236 MAIN FIRMWARE
 * Project: Smart-Shield (Fail-Safe Remote Upgradable IoT Infrastructure)
 * Event: Lean Start-up & MVP Boot Camp (31st August)
 *
 * Target: NXP FRDM-MCXN236 (Dual-Core ARM Cortex-M33)
 */

#include "ota_guardian_state_machine.h"
#include "gpio_control.h"
#include "lcd_driver.h"
#include "uart_protocol.h"
#include "rfid_rc522.h"
#include "flash_map.h"
#include <stdio.h>
#include <string.h>

static ota_device_context_t g_device_ctx;

void SmartTransit_DisplayRFIDAction(const char *version, bool card_tapped) {
    if (strcmp(version, "1.0.0") == 0) {
        if (!card_tapped) {
            LCD_PrintLine(1, "SmartPass v1.0");
            LCD_PrintLine(2, "Tap Card...");
        } else {
            LCD_PrintLine(1, "Access: GRANTED");
            LCD_PrintLine(2, "UID: 4A:3F:82:1C");
            GPIO_Update_LEDs(LED_MODE_BANK_A_HEALTHY);
            GPIO_Trigger_Buzzer(100, 1);
        }
    } else if (strcmp(version, "2.0.0") == 0) {
        if (!card_tapped) {
            LCD_PrintLine(1, "MetroPay v2.0");
            LCD_PrintLine(2, "Bal & Route Mode");
        } else {
            LCD_PrintLine(1, "Paid: Rs.25");
            LCD_PrintLine(2, "Bal: Rs.475 OK");
            GPIO_Update_LEDs(LED_MODE_BANK_B_ACTIVE);
            GPIO_Trigger_Buzzer(80, 2);
        }
    }
}

void System_Init(void) {
    printf("=================================================================\n");
    printf("     SMART-SHIELD — FAIL-SAFE REMOTE UPGRADABLE INFRASTRUCTURE    \n");
    printf("  \"Zero-Downtime Assurance for Critical Public Access Systems\"   \n");
    printf("=================================================================\n");

    OTA_Guardian_Init(&g_device_ctx);
    GPIO_Init_Peripherals();
    LCD_Init();
    RFID_RC522_Init();
    UART_Protocol_Init(115200);

    /* Baseline: Bank A (v1.0.0 SmartPass) */
    GPIO_Update_LEDs(g_device_ctx.led_mode);
    SmartTransit_DisplayRFIDAction("1.0.0", false);
    UART_SendTelemetry(&g_device_ctx);
}

int main(void) {
    System_Init();

    /* -------------------------------------------------------------
     * SCENE 1: BASELINE NORMAL OPERATION (SmartPass v1.0)
     * ------------------------------------------------------------- */
    printf("\n>>> SCENE 1: BASELINE v1.0.0 (LEGACY SMARTPASS MODE) <<<\n");
    SmartTransit_DisplayRFIDAction("1.0.0", false);
    UART_SendTelemetry(&g_device_ctx);

    /* Simulate User Tapping RFID Card */
    printf(">> [EVENT] RFID Card Tapped on Terminal...\n");
    SmartTransit_DisplayRFIDAction("1.0.0", true);
    UART_SendTelemetry(&g_device_ctx);

    /* -------------------------------------------------------------
     * SCENE 2: REMOTE FEATURE OTA ROLLOUT (MetroPay v2.0)
     * ------------------------------------------------------------- */
    printf("\n>>> SCENE 2: REMOTE FEATURE UPDATE (v2.0.0 METROPAY UPGRADE) <<<\n");
    if (OTA_Guardian_VerifyCandidateImage("2.0.0", HARDWARE_TARGET_MCXN236, true, false)) {
        if (OTA_Guardian_StageCandidateToBank(&g_device_ctx, "2.0.0")) {
            LCD_PrintLine(1, "OTA DOWNLOADING");
            LCD_PrintLine(2, "BANK B STAGING");
            GPIO_Update_LEDs(LED_MODE_OTA_VERIFYING);
            UART_SendTelemetry(&g_device_ctx);

            /* Boot & Health Gate Validation */
            if (OTA_Guardian_RunHealthGate(&g_device_ctx, false)) {
                OTA_Guardian_ConfirmNewFirmware(&g_device_ctx);
                GPIO_Update_LEDs(LED_MODE_BANK_B_ACTIVE);
                SmartTransit_DisplayRFIDAction("2.0.0", false);
                UART_SendTelemetry(&g_device_ctx);

                /* Tap RFID on upgraded v2.0.0 */
                printf(">> [EVENT] RFID Card Tapped on Upgraded v2.0 Terminal...\n");
                SmartTransit_DisplayRFIDAction("2.0.0", true);
                UART_SendTelemetry(&g_device_ctx);
            }
        }
    }

    /* -------------------------------------------------------------
     * SCENE 3: SECURITY ATTACK LAB — REJECTING TAMPERED FIRMWARE
     * ------------------------------------------------------------- */
    printf("\n>>> SCENE 3: MALICIOUS PAYLOAD TAMPERING TEST <<<\n");
    OTA_Guardian_VerifyCandidateImage("2.0.1-MALICIOUS", HARDWARE_TARGET_MCXN236, true, true);

    /* -------------------------------------------------------------
     * SCENE 4: FAULT INJECTION & AUTONOMOUS WATCHDOG ROLLBACK
     * ------------------------------------------------------------- */
    printf("\n>>> SCENE 4: CORRUPTED OTA DEPLOYMENT & GUARDIAN SELF-HEAL <<<\n");
    if (OTA_Guardian_VerifyCandidateImage("3.0.0-BROKEN", HARDWARE_TARGET_MCXN236, true, false)) {
        if (OTA_Guardian_StageCandidateToBank(&g_device_ctx, "3.0.0-BROKEN")) {
            LCD_PrintLine(1, "CRITICAL ERROR");
            LCD_PrintLine(2, "WATCHDOG TIMEOUT");

            /* Health Check Fails */
            if (!OTA_Guardian_RunHealthGate(&g_device_ctx, true)) {
                OTA_Guardian_TriggerRollback(&g_device_ctx, "Runtime Sensor Crash / Watchdog Timeout");
                GPIO_Update_LEDs(LED_MODE_ROLLBACK_ALARM);
                GPIO_Trigger_Buzzer(250, 3);
                LCD_PrintLine(1, "ROLLBACK ACTIVE");
                LCD_PrintLine(2, "RESTORED v1.0.0");
                UART_SendTelemetry(&g_device_ctx);
            }
        }
    }

    /* -------------------------------------------------------------
     * SCENE 5: OPERATOR RECOVERY APPROVAL
     * ------------------------------------------------------------- */
    printf("\n>>> SCENE 5: OPERATOR VERIFICATION & SAFE MODE CLEAR <<<\n");
    OTA_Guardian_ApproveRecovery(&g_device_ctx);
    GPIO_Update_LEDs(g_device_ctx.led_mode);
    SmartTransit_DisplayRFIDAction("1.0.0", false);
    UART_SendTelemetry(&g_device_ctx);

    printf("\n=================================================================\n");
    printf("   DEMO COMPLETE: ZERO-DOWNTIME PUBLIC INFRASTRUCTURE PROVEN!    \n");
    printf("=================================================================\n");

    return 0;
}
