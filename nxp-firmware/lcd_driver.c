#include "lcd_driver.h"
#include <stdio.h>
#include <string.h>

void LCD_Init(void) {
    printf("[16x2 LCD] Initialized on I2C address 0x%02X\n", LCD_I2C_ADDR);
}

void LCD_Clear(void) {
    /* Send HD44780 clear display command */
}

void LCD_PrintLine(uint8_t line, const char *text) {
    printf("[16x2 LCD L%d] %s\n", line, text);
}

void LCD_UpdateOTAStatus(const ota_device_context_t *ctx) {
    if (!ctx) return;
    char line1[20];
    char line2[20];

    if (ctx->safe_mode) {
        snprintf(line1, sizeof(line1), "BANK:%s v%s", (ctx->active_bank == BANK_A) ? "A" : "B", ctx->current_version);
        snprintf(line2, sizeof(line2), "SAFE MODE ACTIVE");
    } else {
        snprintf(line1, sizeof(line1), "BANK:%s v%s", (ctx->active_bank == BANK_A) ? "A" : "B", ctx->current_version);
        snprintf(line2, sizeof(line2), "HEALTH: %d%% OK", ctx->health_score);
    }

    LCD_PrintLine(1, line1);
    LCD_PrintLine(2, line2);
}
