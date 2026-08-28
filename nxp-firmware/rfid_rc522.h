#ifndef RFID_RC522_H_
#define RFID_RC522_H_

#include <stdint.h>
#include <stdbool.h>

/**
 * RC522 RFID SPI Driver for NXP FRDM-MCXN236
 *
 * CS (SDA): P0_27
 * SCK:      P0_24
 * MOSI:     P0_26
 * MISO:     P0_25
 * RST:      P1_2
 */

typedef struct {
    uint8_t uid[5];
    uint8_t uid_length;
    bool card_present;
} rfid_card_t;

void RFID_RC522_Init(void);
bool RFID_RC522_CheckCard(rfid_card_t *card);
void RFID_RC522_GetUIDString(const rfid_card_t *card, char *out_str, uint32_t max_len);

#endif /* RFID_RC522_H_ */
