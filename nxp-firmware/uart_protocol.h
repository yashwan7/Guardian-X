#ifndef UART_PROTOCOL_H_
#define UART_PROTOCOL_H_

#include "ota_guardian_state_machine.h"
#include <stdint.h>

void UART_Protocol_Init(uint32_t baud_rate);
void UART_SendTelemetry(const ota_device_context_t *ctx);
bool UART_ReceiveCommand(char *cmd_buf, uint32_t max_len);

#endif /* UART_PROTOCOL_H_ */
