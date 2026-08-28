#ifndef LCD_DRIVER_H_
#define LCD_DRIVER_H_

#include "ota_guardian_state_machine.h"
#include <stdint.h>

#define LCD_I2C_ADDR 0x27

void LCD_Init(void);
void LCD_Clear(void);
void LCD_PrintLine(uint8_t line, const char *text);
void LCD_UpdateOTAStatus(const ota_device_context_t *ctx);

#endif /* LCD_DRIVER_H_ */
