#include "ota_guardian_state_machine.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

void OTA_Guardian_Init(ota_device_context_t *ctx) {
    if (!ctx) return;
    memset(ctx, 0, sizeof(ota_device_context_t));

    ctx->active_bank = BANK_A;
    ctx->inactive_bank = BANK_B;
    ctx->state = OTA_STATE_IDLE;
    strncpy(ctx->current_version, "1.0.0", sizeof(ctx->current_version));
    ctx->candidate_version[0] = '\0';
    ctx->health_score = 100;
    ctx->safe_mode = false;
    ctx->restart_count = 1;
    ctx->led_mode = LED_MODE_BANK_A_HEALTHY;
}

bool OTA_Guardian_CheckAntiDowngrade(const char *candidate_ver, const char *current_ver) {
    int cand_major = 1, cand_minor = 0, cand_patch = 0;
    int curr_major = 1, curr_minor = 0, curr_patch = 0;

    sscanf(candidate_ver, "%d.%d.%d", &cand_major, &cand_minor, &cand_patch);
    sscanf(current_ver, "%d.%d.%d", &curr_major, &curr_minor, &curr_patch);

    if (cand_major < curr_major) return false;
    if (cand_major == curr_major && cand_minor < curr_minor) return false;
    if (cand_major == curr_major && cand_minor == curr_minor && cand_patch < curr_patch) return false;

    return true;
}

bool OTA_Guardian_VerifyCandidateImage(const char *version, const char *target_hw, bool is_signed, bool is_tampered) {
    /* 1. Hardware Compatibility Check */
    if (strcmp(target_hw, HARDWARE_TARGET_MCXN236) != 0) {
        printf("[NXP CRYPTO] Incompatible Hardware Target: %s (Expected: %s)\n", target_hw, HARDWARE_TARGET_MCXN236);
        return false;
    }

    /* 2. Signature Check */
    if (!is_signed) {
        printf("[NXP CRYPTO] REJECTED: Candidate is Unsigned\n");
        return false;
    }

    /* 3. SHA-256 Digest Integrity Check */
    if (is_tampered) {
        printf("[NXP CRYPTO] REJECTED: SHA-256 Hash Digest Mismatch / Tampering Detected\n");
        return false;
    }

    printf("[NXP CRYPTO] Verification PASS: %s valid for %s\n", version, target_hw);
    return true;
}

bool OTA_Guardian_StageCandidateToBank(ota_device_context_t *ctx, const char *candidate_version) {
    if (!ctx || !candidate_version) return false;

    if (!OTA_Guardian_CheckAntiDowngrade(candidate_version, ctx->current_version)) {
        printf("[NXP OTA] BLOCKED: Anti-Downgrade Violation! Attempted %s on %s\n", candidate_version, ctx->current_version);
        return false;
    }

    ctx->state = OTA_STATE_DOWNLOADING;
    ctx->led_mode = LED_MODE_OTA_VERIFYING;
    strncpy(ctx->candidate_version, candidate_version, sizeof(ctx->candidate_version));

    /* Target the inactive bank without touching known-good active bank */
    ctx->inactive_bank = (ctx->active_bank == BANK_A) ? BANK_B : BANK_A;
    printf("[NXP FLASH] Flashing candidate %s to Inactive Slot Bank %s\n",
           candidate_version, (ctx->inactive_bank == BANK_A) ? "A" : "B");

    ctx->state = OTA_STATE_PENDING_BOOT;
    return true;
}

bool OTA_Guardian_RunHealthGate(ota_device_context_t *ctx, bool simulate_fault) {
    if (!ctx) return false;

    ctx->state = OTA_STATE_HEALTH_CHECK;

    /* Temporary boot switch to candidate bank */
    ota_bank_t prev_bank = ctx->active_bank;
    ctx->active_bank = ctx->inactive_bank;
    ctx->inactive_bank = prev_bank;

    if (simulate_fault || strstr(ctx->candidate_version, "BROKEN") != NULL) {
        /* Health gate fail scenario */
        ctx->health_score = 15;
        ctx->state = OTA_STATE_HEALTH_FAILED;
        printf("[HEALTH GATE] FAILED! Runtime Watchdog timeout & sensor crash detected on Bank %s\n",
               (ctx->active_bank == BANK_A) ? "A" : "B");
        return false;
    }

    /* Normal healthy confirmation */
    ctx->health_score = 100;
    return true;
}

void OTA_Guardian_TriggerRollback(ota_device_context_t *ctx, const char *reason) {
    if (!ctx) return;

    printf("[WATCHDOG RECOVERY] Initiating Atomic Rollback to Known-Good Bank %s! Reason: %s\n",
           (ctx->inactive_bank == BANK_A) ? "A" : "B", reason ? reason : "Health Check Failed");

    /* Atomic Bank Swap Back to Known-Good Slot */
    ota_bank_t rolled_back_bank = ctx->inactive_bank;
    ctx->inactive_bank = ctx->active_bank;
    ctx->active_bank = rolled_back_bank;

    ctx->state = OTA_STATE_SAFE_MODE;
    ctx->safe_mode = true;
    ctx->health_score = 65; /* Restricted operation mode */
    ctx->led_mode = LED_MODE_ROLLBACK_ALARM;
}

void OTA_Guardian_ConfirmNewFirmware(ota_device_context_t *ctx) {
    if (!ctx) return;

    strncpy(ctx->current_version, ctx->candidate_version, sizeof(ctx->current_version));
    ctx->candidate_version[0] = '\0';
    ctx->state = OTA_STATE_CONFIRMED;
    ctx->safe_mode = false;
    ctx->health_score = 100;
    ctx->led_mode = (ctx->active_bank == BANK_A) ? LED_MODE_BANK_A_HEALTHY : LED_MODE_BANK_B_ACTIVE;

    printf("[NXP OTA] SUCCESS: Firmware %s CONFIRMED and marked PERMANENT on Bank %s\n",
           ctx->current_version, (ctx->active_bank == BANK_A) ? "A" : "B");
}

void OTA_Guardian_ApproveRecovery(ota_device_context_t *ctx) {
    if (!ctx) return;
    ctx->safe_mode = false;
    ctx->state = OTA_STATE_IDLE;
    ctx->health_score = 100;
    ctx->led_mode = (ctx->active_bank == BANK_A) ? LED_MODE_BANK_A_HEALTHY : LED_MODE_BANK_B_ACTIVE;
    printf("[OPERATOR] Safe Mode CLEARED. System returned to standard active state.\n");
}

void OTA_Guardian_GetTelemetryJSON(const ota_device_context_t *ctx, char *buffer, uint32_t max_len) {
    if (!ctx || !buffer) return;

    const char *state_str = "IDLE";
    switch (ctx->state) {
        case OTA_STATE_DOWNLOADING:   state_str = "DOWNLOADING"; break;
        case OTA_STATE_VERIFYING:     state_str = "VERIFYING"; break;
        case OTA_STATE_PENDING_BOOT:  state_str = "PENDING_BOOT"; break;
        case OTA_STATE_HEALTH_CHECK:  state_str = "HEALTH_CHECK"; break;
        case OTA_STATE_CONFIRMED:     state_str = "CONFIRMED"; break;
        case OTA_STATE_HEALTH_FAILED: state_str = "HEALTH_FAILED"; break;
        case OTA_STATE_ROLLBACK:      state_str = "ROLLBACK"; break;
        case OTA_STATE_SAFE_MODE:     state_str = "SAFE_MODE"; break;
        default:                      state_str = "IDLE"; break;
    }

    snprintf(buffer, max_len,
             "{\"deviceId\":\"NXP-001\",\"bank\":\"%s\",\"version\":\"%s\",\"otaState\":\"%s\",\"health\":%u,\"safeMode\":%s}",
             (ctx->active_bank == BANK_A) ? "A" : "B",
             ctx->current_version,
             state_str,
             ctx->health_score,
             ctx->safe_mode ? "true" : "false");
}
