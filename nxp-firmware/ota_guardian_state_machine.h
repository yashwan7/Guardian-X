#ifndef OTA_GUARDIAN_STATE_MACHINE_H_
#define OTA_GUARDIAN_STATE_MACHINE_H_

#include "flash_map.h"
#include <stdbool.h>
#include <stdint.h>

typedef enum {
    LED_MODE_BANK_A_HEALTHY = 0,
    LED_MODE_OTA_VERIFYING,
    LED_MODE_BANK_B_ACTIVE,
    LED_MODE_ROLLBACK_ALARM,
    LED_MODE_SAFE_MODE_RESTRICTED
} ota_led_mode_t;

typedef struct {
    ota_bank_t            active_bank;
    ota_bank_t            inactive_bank;
    ota_lifecycle_state_t state;
    char                  current_version[16];
    char                  candidate_version[16];
    uint8_t               health_score;      /* 0 - 100 */
    bool                  safe_mode;
    uint32_t              watchdog_ticks;
    uint32_t              restart_count;
    ota_led_mode_t        led_mode;
} ota_device_context_t;

/* Core State Machine API */
void OTA_Guardian_Init(ota_device_context_t *ctx);
bool OTA_Guardian_VerifyCandidateImage(const char *version, const char *target_hw, bool is_signed, bool is_tampered);
bool OTA_Guardian_CheckAntiDowngrade(const char *candidate_version, const char *current_version);
bool OTA_Guardian_StageCandidateToBank(ota_device_context_t *ctx, const char *candidate_version);
bool OTA_Guardian_RunHealthGate(ota_device_context_t *ctx, bool simulate_fault);
void OTA_Guardian_TriggerRollback(ota_device_context_t *ctx, const char *reason);
void OTA_Guardian_ConfirmNewFirmware(ota_device_context_t *ctx);
void OTA_Guardian_ApproveRecovery(ota_device_context_t *ctx);
void OTA_Guardian_GetTelemetryJSON(const ota_device_context_t *ctx, char *buffer, uint32_t max_len);

#endif /* OTA_GUARDIAN_STATE_MACHINE_H_ */
