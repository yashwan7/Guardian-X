#include "uart_protocol.h"
#include <stdio.h>
#include <string.h>

void UART_Protocol_Init(uint32_t baud_rate) {
    printf("[UART] Direct NXP ↔ Arduino UNO R4 Serial Link Initialized at %u baud.\n", baud_rate);
}

void UART_SendTelemetry(const ota_device_context_t *ctx) {
    char json_buf[192];
    OTA_Guardian_GetTelemetryJSON(ctx, json_buf, sizeof(json_buf));
    /* Transmit over UART to Arduino UNO R4 */
    printf("%s\n", json_buf);
}

bool UART_ReceiveCommand(char *cmd_buf, uint32_t max_len) {
    (void)cmd_buf;
    (void)max_len;
    /* Read non-blocking from UART RX buffer from Arduino UNO R4 */
    return false;
}
