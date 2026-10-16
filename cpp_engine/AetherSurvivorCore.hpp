#pragma once
#include <vector>
#include <cmath>
#include <cstdint>
#include <string>
#include <unordered_map>
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

    /**
     * Ciclo de 5 Oleadas por Nivel (Estilo Duck Survival / Last War / Zombie Defense 3D):
     * - Oleadas 1 a 4: Hordas normales -> Al matar la oleada cae Lluvia de Dinero ($$$) -> Mejora de Base.
     * - Oleada 5: ¡Aparece el Jefe Final del Nivel!
     */
    enum class StagePhase : uint8_t {
        WaveCombat        = 0,
        WaveClearCashDrop = 1,
        BaseUpgradeIntermission = 2,
        FinalBossWave5    = 3,
        StageVictory      = 4
    };

    enum class BuildingType : uint8_t {
        CommandBunker    = 0, // Núcleo de mando y curación
        FrontBarricade   = 1, // Muro defensivo con púas eléctricas
        HeavyTurrets     = 2, // Torretas metralleta / misiles en flancos
        CashArmory       = 3, // Fábrica de billetes y mejora de calibre
        MercenarySquad   = 4  // Escuadrón de soldados defensores 3D
    };

    struct BaseBuildingPad {
        BuildingType type;
        int level = 1;
        int maxLevel = 30;
        Vec3 worldPos;
        int cashInvestedInCurrentLevel = 0;

        int getUpgradeCost() const {
            return static_cast<int>(80.0 * std::pow(1.30, level - 1));
        }
    };

    struct ActiveSkill {
        std::string id;
        std::string name;
        float cooldown = 10.0f;
        float currentCooldown = 0.0f;
        float damageMultiplier = 4.0f;

        bool isReady() const { return currentCooldown <= 0.0f; }
    };

    struct Enemy3D {
        uint32_t id;
        Vec3 pos;
        float hp;
        float maxHp;
        float atk;
        float speed;
        float radius;
        bool isFinalBoss;
        bool alive = true;
    };

    struct CashBundle3D {
        Vec3 pos;
        int cashAmount;
        bool magnetized = false;
        bool collected = false;
    };

    /**
     * Mapa Semi-Cerrado (Recinto Fortificado 3D):
     * Limita el movimiento del jugador y los enemigos dentro de los muros perimetrales.
     */
    struct EnclosedArenaBounds {
        float minX = -13.5f;
        float maxX =  13.5f;
        float minZ = -15.5f; // Puertas Norte de invasión
        float maxZ =  13.5f; // Zona Sur de la Base

        void clampPosition(Vec3& p, float entityRadius = 0.7f) const {
            p.x = std::max(minX + entityRadius, std::min(maxX - entityRadius, p.x));
            p.z = std::max(minZ + entityRadius, std::min(maxZ - entityRadius, p.z));
        }
    };

    class AetherTacticalArenaSim {
    public:
        AetherTacticalArenaSim();
        void update(float dt);
        void startWave(int waveIdx);
        void triggerWaveClearReward();
        bool investCashIntoPad(BuildingType type, int amount);
        bool castActiveSkill(int skillIndex);

        EnclosedArenaBounds arenaBounds;
        StagePhase currentPhase = StagePhase::WaveCombat;

        int currentStage = 1;
        int currentWave = 1; // 1..5 (5 = Jefe Final)
        int enemiesRemainingInWave = 0;
        int cashDollars = 300;
        float barricadeHp = 1500.0f;
        float barricadeMaxHp = 1500.0f;

        Vec3 playerPos{0.0f, 0.0f, 4.5f};
        std::vector<BaseBuildingPad> basePads;
        std::vector<ActiveSkill> skills;
        std::vector<Enemy3D> enemies;
        std::vector<CashBundle3D> cashDrops;

    private:
        uint32_t m_nextEnemyId = 1;
    };

} // namespace AetherEngine3D
