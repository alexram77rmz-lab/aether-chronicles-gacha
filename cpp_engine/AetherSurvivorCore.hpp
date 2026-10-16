#pragma once
#include <vector>
#include <cmath>
#include <cstdint>
#include <string>
#include <array>
#include <algorithm>

namespace AetherEngine3D {

    struct Vec3 {
        float x = 0.0f;
        float y = 0.0f;
        float z = 0.0f;

        Vec3 operator+(const Vec3& o) const { return {x + o.x, y + o.y, z + o.z}; }
        Vec3 operator-(const Vec3& o) const { return {x - o.x, y - o.y, z - o.z}; }
        Vec3 operator*(float s) const { return {x * s, y * s, z * s}; }

        float lengthSqXZ() const { return x * x + z * z; }
        float lengthXZ() const { return std::sqrt(lengthSqXZ()); }
        Vec3 normalizedXZ() const {
            float len = lengthXZ();
            if (len < 0.0001f) return {0.0f, 0.0f, 0.0f};
            return {x / len, 0.0f, z / len};
        }
    };

    // Elementos de Sinergia (Idénticos a la arquitectura de Duck Survival)
    enum class ElementType : uint8_t {
        Fire      = 0, // Impacto Ígneo / Meteorito
        Frost     = 1, // Estalactitas de Hielo
        Lightning = 2, // Cadena de Relámpagos / Torre EMP
        Energy    = 3, // Láser Concentrado
        Physical  = 4  // Ráfaga Gattling / Señuelo Explosivo
    };

    // Ciclo "Construir de Día / Defender de Noche" (5 Oleadas + Jefe Final)
    enum class DayNightPhase : uint8_t {
        DayBuildAndEconomy = 0, // Sol cálido, minas producen $$$, mejoras de base
        NightHordeCombat   = 1, // Noche azul neón, hordas 1/5 a 4/5
        NightFinalBossWave = 2  // Oleada 5/5: Luna Roja + Jefe Final Gigante
    };

    // Las 6 Estructuras de la Base en el Recinto Cerrado
    enum class BaseStructureType : uint8_t {
        GoldMine         = 0, // Economía Día: Genera billetes ($$$)
        SurvivorCamp     = 1, // Economía/Soporte: Regenera muro y +ingreso
        ElectricFence    = 2, // Defensa Frontal: Valla electrificada
        MachineGunTurret = 3, // Defensa Activa: Torretas Gattling dobles
        EMPTower         = 4, // Control de Masas: Pulsos EMP que ralentizan 55%
        InfantryBarracks = 5  // Tropas 3D: Soldados aliados en el patio
    };

    // Los 6 Slots de Equipamiento del Comandante
    enum class GearSlotType : uint8_t {
        Weapon = 0,
        Helmet = 1,
        Armor  = 2,
        Gloves = 3,
        Boots  = 4,
        Belt   = 5
    };

    // Rareza de Gemas Engarzables (Fusión 3 en 1: Blue -> Purple -> Gold -> MythicRed)
    enum class GemTier : uint8_t {
        BlueRare       = 1,
        PurpleEpic     = 2,
        GoldLegendary  = 3,
        MythicRed      = 4
    };

    struct SocketGem {
        uint32_t gemId;
        GemTier tier;
        ElementType element;
        float damageBonusPct; // +8% (Azul) hasta +45% (Mítica Roja)
    };

    struct EquipmentSlot {
        GearSlotType slot;
        int level = 1;
        std::vector<SocketGem> socketedGems;

        int getUpgradeCostCash() const { return 100 * level; }
        float getStatMultiplier() const {
            float mult = 1.0f + (level - 1) * 0.12f;
            for (const auto& g : socketedGems) mult += g.damageBonusPct;
            return mult;
        }
    };

    // Escuadrón 2+2 (2 Héroes Activos en 3D + 2 Héroes de Soporte Pasivo)
    struct HeroUnit {
        std::string id;
        std::string name;
        ElementType element;
        int level = 1;
        int stars = 1;
        bool isActiveOnField = false; // true = Camina y dispara en 3D (máx 2), false = Soporte Pasivo (máx 2)
    };

    struct BaseStructurePad {
        BaseStructureType type;
        int level = 1;
        Vec3 worldPos;
        int getUpgradeCost() const {
            return static_cast<int>(65.0 * std::pow(1.28, level - 1));
        }
    };

    class DuckSurvivalStyleEngine {
    public:
        DuckSurvivalStyleEngine();
        void toggleDayNightPhase();
        bool upgradeBaseStructure(BaseStructureType type);
        bool upgradeGearSlot(GearSlotType slot);
        bool mergeThreeGemsInInventory();
        float calculateTotalElementalSynergyMultiplier() const;

        DayNightPhase phase = DayNightPhase::DayBuildAndEconomy;
        int currentStage = 1;
        int currentWave = 1; // 1..5
        int cashDollars = 400;
        int gemsCurrency = 5400;
        int gearBlueprints = 25;

        std::array<EquipmentSlot, 6> gearSlots;
        std::vector<SocketGem> gemInventory;
        std::vector<HeroUnit> squadRoster;
        std::vector<BaseStructurePad> baseStructures;
    };

} // namespace AetherEngine3D
