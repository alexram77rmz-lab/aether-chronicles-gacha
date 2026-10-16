#include "AetherSurvivorCore.hpp"

namespace AetherEngine3D {

    AetherSurvivorSimulation::AetherSurvivorSimulation() {
        // Inicializar los 5 Pads de Construcción de la Base 3D
        buildings.push_back({BuildingType::CommandCitadel, 1, 25, {0.0f, 0.0f, 0.0f}, 3.2f, 0.0f});
        buildings.push_back({BuildingType::LaserTurret,    1, 25, {-6.0f, 0.0f, -6.0f}, 2.2f, 0.0f});
        buildings.push_back({BuildingType::GoldExtractor,  1, 25, {6.5f, 0.0f, -5.5f}, 2.2f, 0.0f});
        buildings.push_back({BuildingType::ForcefieldDome, 1, 25, {-6.5f, 0.0f, 6.0f}, 2.2f, 0.0f});
        buildings.push_back({BuildingType::SquadBarracks,  1, 25, {6.5f, 0.0f, 6.0f}, 2.2f, 0.0f});
    }

    bool AetherSurvivorSimulation::upgradeBuilding(BuildingType type) {
        for (auto& b : buildings) {
            if (b.type == type && b.level < b.maxLevel) {
                uint64_t cost = b.getUpgradeCost();
                if (goldCoins >= cost) {
                    goldCoins -= cost;
                    b.level++;
                    if (type == BuildingType::CommandCitadel) {
                        playerMaxHp += 450.0f;
                        playerHp = playerMaxHp;
                    }
                    return true;
                }
            }
        }
        return false;
    }

    void AetherSurvivorSimulation::spawnWave(int waveNumber) {
        currentWave = waveNumber;
        int count = 14 + waveNumber * 4;
        bool hasBoss = (waveNumber % 3 == 0);

        for (int i = 0; i < count; ++i) {
            float angle = (static_cast<float>(i) / count) * 6.283185f;
            float dist = 22.0f + (i % 5) * 2.5f;
            bool isBoss = (hasBoss && i == 0);

            Enemy3D e;
            e.id = m_nextEnemyId++;
            e.pos = {std::cos(angle) * dist, 0.0f, std::sin(angle) * dist};
            e.maxHp = (180.0f * std::pow(1.22f, waveNumber - 1)) * (isBoss ? 8.0f : 1.0f);
            e.hp = e.maxHp;
            e.atk = 25.0f * std::pow(1.15f, waveNumber - 1);
            e.speed = isBoss ? 3.2f : (4.2f + (i % 3) * 0.6f);
            e.radius = isBoss ? 1.8f : 0.75f;
            e.isBoss = isBoss;
            e.alive = true;
            enemies.push_back(e);
        }
    }

    void AetherSurvivorSimulation::stepSimulation(float dt) {
        orbitalAngle += dt * 3.8f;
        m_grid.clear();

        // 1. Mover enemigos hacia el jugador o la base e insertarlos en el Spatial Hash Grid
        for (uint32_t i = 0; i < enemies.size(); ++i) {
            auto& e = enemies[i];
            if (!e.alive) continue;

            Vec3 dir = (playerPos - e.pos).normalizedXZ();
            e.pos = e.pos + dir * (e.speed * dt);
            m_grid.insert(i, e.pos);
        }

        // 2. Daño de Espadas Orbitales 3D (Estilo Survivor.io Guardian)
        float bladeOrbitRadius = 3.4f;
        std::vector<uint32_t> nearby;
        for (int b = 0; b < orbitalBladeCount; ++b) {
            float a = orbitalAngle + (b * 6.283185f / orbitalBladeCount);
            Vec3 bladePos{
                playerPos.x + std::cos(a) * bladeOrbitRadius,
                0.0f,
                playerPos.z + std::sin(a) * bladeOrbitRadius
            };

            nearby.clear();
            m_grid.queryRadius(bladePos, 1.3f, nearby);
            for (uint32_t idx : nearby) {
                auto& en = enemies[idx];
                if (!en.alive) continue;
                if ((en.pos - bladePos).lengthSqXZ() <= 1.5f) {
                    en.hp -= 140.0f * dt * 5.0f;
                    if (en.hp <= 0.0f) {
                        en.alive = false;
                        lootDrops.push_back({en.pos, en.isBoss ? 150 : 18, en.isBoss ? 100 : 20, false, false});
                    }
                }
            }
        }

        // 3. Imán de Monedas y Cristales XP
        for (auto& drop : lootDrops) {
            if (drop.collected) continue;
            float distSq = (playerPos - drop.pos).lengthSqXZ();
            if (distSq <= magnetRadius * magnetRadius) {
                drop.isMagnetized = true;
            }
            if (drop.isMagnetized) {
                Vec3 dir = (playerPos - drop.pos).normalizedXZ();
                drop.pos = drop.pos + dir * (18.0f * dt);
                if (distSq <= 0.8f) {
                    drop.collected = true;
                    goldCoins += drop.goldValue;
                    playerXp += drop.xpValue;
                }
            }
        }
    }

} // namespace AetherEngine3D
