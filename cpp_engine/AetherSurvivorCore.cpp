#include "AetherSurvivorCore.hpp"

namespace AetherEngine3D {

    AetherTacticalArenaSim::AetherTacticalArenaSim() {
        basePads.push_back({BuildingType::CommandBunker,  1, 30, { 0.0f, 0.0f,  8.5f}, 0});
        basePads.push_back({BuildingType::FrontBarricade, 1, 30, { 0.0f, 0.0f,  1.5f}, 0});
        basePads.push_back({BuildingType::HeavyTurrets,   1, 30, {-6.5f, 0.0f,  2.5f}, 0});
        basePads.push_back({BuildingType::CashArmory,     1, 30, { 6.5f, 0.0f,  2.5f}, 0});
        basePads.push_back({BuildingType::MercenarySquad, 1, 30, {-5.5f, 0.0f,  8.0f}, 0});

        skills.push_back({"airstrike", "Ataque Aereo de Misiles", 12.0f, 0.0f, 5.5f});
        skills.push_back({"overdrive", "Tormenta Electrica & Cadencia", 10.0f, 0.0f, 3.8f});
        skills.push_back({"medshield", "Reparacion de Muro & Escudo", 14.0f, 0.0f, 2.0f});
    }

    void AetherTacticalArenaSim::startWave(int waveIdx) {
        currentWave = waveIdx;
        enemies.clear();

        bool isFinalBossWave = (currentWave == 5);
        currentPhase = isFinalBossWave ? StagePhase::FinalBossWave5 : StagePhase::WaveCombat;

        int mobCount = isFinalBossWave ? 8 : (6 + currentWave * 3);
        float stageScale = std::pow(1.35f, currentStage - 1);

        // En Oleada 5 generamos el Jefe Final gigante en la Puerta Central Norte
        if (isFinalBossWave) {
            Enemy3D boss;
            boss.id = m_nextEnemyId++;
            boss.pos = {0.0f, 0.0f, -14.0f};
            boss.maxHp = 2200.0f * stageScale;
            boss.hp = boss.maxHp;
            boss.atk = 65.0f * stageScale;
            boss.speed = 2.6f;
            boss.radius = 2.1f;
            boss.isFinalBoss = true;
            boss.alive = true;
            enemies.push_back(boss);
        }

        // Generar horda saliendo por las 3 puertas del recinto norte
        const float gateX[3] = {-7.5f, 0.0f, 7.5f};
        for (int i = 0; i < mobCount; ++i) {
            Enemy3D e;
            e.id = m_nextEnemyId++;
            float gx = gateX[i % 3] + ((i % 2 == 0) ? -0.9f : 0.9f);
            float gz = -14.2f - (i / 3) * 1.3f;
            e.pos = {gx, 0.0f, gz};
            e.maxHp = (140.0f + currentWave * 35.0f) * stageScale;
            e.hp = e.maxHp;
            e.atk = 18.0f * stageScale;
            e.speed = 3.6f + (i % 3) * 0.45f;
            e.radius = 0.75f;
            e.isFinalBoss = false;
            e.alive = true;
            enemies.push_back(e);
        }

        enemiesRemainingInWave = static_cast<int>(enemies.size());
    }

    void AetherTacticalArenaSim::triggerWaveClearReward() {
        currentPhase = StagePhase::WaveClearCashDrop;
        int armoryLv = basePads[3].level;
        int packCount = 8 + currentWave * 2;
        int packValue = static_cast<int>((35 + currentWave * 15) * (1.0f + (armoryLv - 1) * 0.25f));

        for (int i = 0; i < packCount; ++i) {
            float angle = (static_cast<float>(i) / packCount) * 6.283185f;
            float r = 2.0f + (i % 3) * 1.4f;
            cashDrops.push_back({{std::cos(angle) * r, 0.0f, -2.0f + std::sin(angle) * r}, packValue, true, false});
        }
    }

    bool AetherTacticalArenaSim::investCashIntoPad(BuildingType type, int amount) {
        for (auto& pad : basePads) {
            if (pad.type == type && pad.level < pad.maxLevel) {
                int needed = pad.getUpgradeCost() - pad.cashInvestedInCurrentLevel;
                int spend = std::min(cashDollars, std::min(amount, needed));
                if (spend <= 0) return false;

                cashDollars -= spend;
                pad.cashInvestedInCurrentLevel += spend;
                if (pad.cashInvestedInCurrentLevel >= pad.getUpgradeCost()) {
                    pad.cashInvestedInCurrentLevel = 0;
                    pad.level++;
                    if (type == BuildingType::FrontBarricade) {
                        barricadeMaxHp += 600.0f;
                        barricadeHp = barricadeMaxHp;
                    }
                    return true;
                }
            }
        }
        return false;
    }

    bool AetherTacticalArenaSim::castActiveSkill(int skillIndex) {
        if (skillIndex < 0 || skillIndex >= static_cast<int>(skills.size())) return false;
        auto& sk = skills[skillIndex];
        if (!sk.isReady()) return false;

        sk.currentCooldown = sk.cooldown;
        return true;
    }

    void AetherTacticalArenaSim::update(float dt) {
        arenaBounds.clampPosition(playerPos, 0.8f);

        for (auto& sk : skills) {
            if (sk.currentCooldown > 0.0f) {
                sk.currentCooldown = std::max(0.0f, sk.currentCooldown - dt);
            }
        }

        int aliveCount = 0;
        for (auto& e : enemies) {
            if (!e.alive) continue;
            aliveCount++;
            Vec3 dir = (playerPos - e.pos).normalizedXZ();
            e.pos = e.pos + dir * (e.speed * dt);
            arenaBounds.clampPosition(e.pos, e.radius);
        }
        enemiesRemainingInWave = aliveCount;

        if (aliveCount == 0 && (currentPhase == StagePhase::WaveCombat || currentPhase == StagePhase::FinalBossWave5)) {
            if (currentWave == 5) {
                currentPhase = StagePhase::StageVictory;
                currentStage++;
            } else {
                triggerWaveClearReward();
            }
        }
    }

} // namespace AetherEngine3D
