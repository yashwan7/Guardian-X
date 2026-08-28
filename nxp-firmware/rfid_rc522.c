#include "rfid_rc522.h"
#include <stdio.h>
#include <string.h>

void RFID_RC522_Init(void) {
    /* Initialize SPI on P0_24 (SCK), P0_26 (MOSI), P0_25 (MISO), P0_27 (CS), P1_2 (RST) */
    printf("[RC522 RFID] Initialized on SPI (CS: P0_27, SCK: P0_24, MOSI: P0_26, MISO: P0_25, RST: P1_2)\n");
}

bool RFID_RC522_CheckCard(rfid_card_t *card) {
    if (!card) return false;
    /* In actual hardware execution, this reads the FIFO from RC522 over SPI */
    return false;
}

void RFID_RC522_GetUIDString(const rfid_card_t *card, char *out_str, uint32_t max_len) {
    if (!card || !out_str) return;
    snprintf(out_str, max_len, "%02X:%02X:%02X:%02X",
             card->uid[0], card->uid[1], card->uid[2], card->uid[3]);
}
