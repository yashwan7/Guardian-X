#ifndef FLASH_MAP_H_
#define FLASH_MAP_H_

#include <stdint.h>
#include <stdbool.h>

/**
 * NXP FRDM-MCXN236 Flash Memory Partitioning (1MB Total Internal Flash)
 *
 * 0x0000_0000 - 0x0001_FFFF (128 KB): Secure Bootloader & Vector Table
 * 0x0002_0000 - 0x0007_FFFF (384 KB): Bank A (Primary Active Image)
 * 0x0008_0000 - 0x000D_FFFF (384 KB): Bank B (Candidate / Secondary Image)
 * 0x000E_0000 - 0x000F_FFFF (128 KB): Persistent OTA Metadata & NVRAM Journal
 */

#define BOOTLOADER_BASE_ADDR        0x00000000UL
#define BOOTLOADER_SIZE_BYTES       (128 * 1024UL)

#define FIRMWARE_BANK_A_ADDR        0x00020000UL
#define FIRMWARE_BANK_B_ADDR        0x00080000UL
#define FIRMWARE_BANK_MAX_SIZE      (384 * 1024UL)

#define OTA_METADATA_SECTOR_ADDR    0x000E0000UL
#define OTA_METADATA_MAGIC          0x53454355UL  /* "SECU" (Secure OTA Magic) */

#define HARDWARE_TARGET_MCXN236     "NXP-FRDM-MCXN236"
#define MIN_SUPPORTED_VERSION_MAJOR 1
#define MIN_SUPPORTED_VERSION_MINOR 0

typedef enum {
    BANK_A = 0,
    BANK_B = 1
} ota_bank_t;

typedef enum {
    OTA_STATE_IDLE = 0,
    OTA_STATE_DOWNLOADING,
    OTA_STATE_VERIFYING,
    OTA_STATE_PENDING_BOOT,
    OTA_STATE_HEALTH_CHECK,
    OTA_STATE_CONFIRMED,
    OTA_STATE_HEALTH_FAILED,
    OTA_STATE_ROLLBACK,
    OTA_STATE_SAFE_MODE
} ota_lifecycle_state_t;

typedef struct __attribute__((packed)) {
    uint32_t magic;
    uint32_t sequence_number;
    uint8_t  active_bank;         /* 0 = Bank A, 1 = Bank B */
    uint8_t  lifecycle_state;     /* ota_lifecycle_state_t */
    char     current_version[16];
    char     pending_version[16];
    uint8_t  sha256_hash[32];
    uint8_t  signature[64];       /* Ed25519 / ECDSA signature */
    uint8_t  safe_mode_active;
    uint32_t boot_attempts_left;  /* Watchdog threshold countdown (e.g. 3 attempts) */
    uint32_t crc32;
} ota_nvram_metadata_t;

#endif /* FLASH_MAP_H_ */
