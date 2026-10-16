#include "AetherSurvivorCore.hpp"

namespace AetherEngine3D {

    DuckSurvivalStyleEngine::DuckSurvivalStyleEngine() {
        for (int i = 0; i < 6; ++i) {
            gearSlots[i].slot = static_cast<GearSlotType>(i);
            gearSlots[i].level = 1;
        }

        // Las 6 Estructuras de la Base (Economía de Día + Defensa de Noche)
        baseStructures.push_back({BaseStructureType::GoldMine,         1, {-6.0f, 0.0f,  8.2f}});
        baseStructures.push_back({BaseStructureType::SurvivorCamp,     1, { 6.0f, 0.0f,  8.2f}});
        baseStructures.push_back({BaseStructureType::ElectricFence,    1, { 0.0f, 0.0f,  1.6f}});
        baseStructures.push_back({BaseStructureType::MachineGunTurret, 1, {-6.2f, 0.0f,  3.2f}});
        baseStructures.push_back({BaseStructureType::EMPTower,         1, { 0.0f, 0.0f,  4.8f}});
        baseStructures.push_back({BaseStructureType::InfantryBarracks, 1, { 6.2f, 0.0f,  3.2f}});

        // Escuadrón 2+2 inicial (2 Activos en campo + 2 de Apoyo Pasivo)
        squadRoster.push_back({"H01", "Comandante Cole (Fuego)", ElementType::Fire,      10, 2, true});
        squadRoster.push_back({"H02", "Vanguardia Mir (Hielo)",  ElementType::Frost,      8, 2, true});
        squadRoster.push_back({"H03", "Artillera Emilie (Fuego)",ElementType::Fire,       8, 1, false});
        squadRoster.push_back({"H04", "Especialista Rava (Fuego)",ElementType::Fire,      7, 1, false});
    }

    void DuckSurvivalStyleEngine::toggleDayNightPhase() {
        if (phase == DayNightPhase::DayBuildAndEconomy) {
            phase = (currentWave == 5)
                ? DayNightPhase::NightFinalBossWave
                : DayNightPhase::NightHordeCombat;
        } else {
            phase = DayNightPhase::DayBuildAndEconomy;
        }
    }

    bool DuckSurvivalStyleEngine::upgradeBaseStructure(BaseStructureType type) {
        for (auto& b : baseStructures) {
            if (b.type == type) {
                int cost = b.getUpgradeCost();
                if (cashDollars >= cost) {
                    cashDollars -= cost;
                    b.level++;
                    return true;
                }
            }
        }
        return false;
    }

    bool DuckSurvivalStyleEngine::upgradeGearSlot(GearSlotType slot) {
        int idx = static_cast<int>(slot);
        int cost = gearSlots[idx].getUpgradeCostCash();
        if (cashDollars >= cost && gearBlueprints >= 1) {
            cashDollars -= cost;
            gearBlueprints -= 1;
            gearSlots[idx].level++;
            return true;
        }
        return false;
    }

    bool DuckSurvivalStyleEngine::mergeThreeGemsInInventory() {
        if (gemInventory.size() < 3) return false;
        GemTier baseTier = gemInventory[0].tier;
        if (baseTier == GemTier::MythicRed) return false;

        ElementType elem = gemInventory[0].element;
        gemInventory.erase(gemInventory.begin(), gemInventory.begin() + 3);

        GemTier nextTier = static_cast<GemTier>(static_cast<uint8_t>(baseTier) + 1);
        float nextBonus = (nextTier == GemTier::PurpleEpic) ? 0.16f :
                          (nextTier == GemTier::GoldLegendary) ? 0.28f : 0.45f;
        gemInventory.push_back({static_cast<uint32_t>(gemInventory.size() + 100), nextTier, elem, nextBonus});
        return true;
    }

    float DuckSurvivalStyleEngine::calculateTotalElementalSynergyMultiplier() const {
        int fireCount = 0;
        for (const auto& h : squadRoster) {
            if (h.element == ElementType::Fire) fireCount++;
        }
        // 3 o más héroes del mismo elemento activan +30% Daño Elemental como en Duck Survival
        return (fireCount >= 3) ? 1.30f : 1.10f;
    }

} // namespace AetherEngine3D
