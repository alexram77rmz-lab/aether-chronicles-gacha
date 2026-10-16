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

    enum class BuildingType : uint8_t {
        CommandCitadel = 0,
        LaserTurret    = 1,
        GoldExtractor  = 2,
        ForcefieldDome = 3,
        SquadBarracks  = 4
    };

    struct BaseBuildingPad {
        BuildingType type;
        int level = 1;
        int maxLevel = 25;
        Vec3 worldPos;
        float radius = 2.5f;
        float cooldownTimer = 0.0f;

        uint64_t getUpgradeCost() const {
            // Escalado equilibrado estilo Duck Survival / Whiteout Survival
            return static_cast<uint64_t>(50.0 * std::pow(1.28, level - 1));
        }
    };

    struct Enemy3D {
        uint32_t id;
        Vec3 pos;
        Vec3 vel;
        float hp;
        float maxHp;
        float atk;
        float speed;
        float radius;
        bool isBoss;
        bool alive = true;
    };

    struct LootDrop3D {
        Vec3 pos;
        int goldValue;
        int xpValue;
        bool isMagnetized = false;
        bool collected = false;
    };

    struct Projectile3D {
        Vec3 pos;
        Vec3 dir;
        float speed;
        float damage;
        float life;
        int pierceCount;
    };

    /**
     * SpatialHashGrid3D:
     * Permite colisionar +1,000 enemigos 3D, proyectiles y monedas magnéticas en O(1)
     * para dispositivos móviles de gama media y alta a 60-120 FPS.
     */
    class SpatialHashGrid3D {
    public:
        explicit SpatialHashGrid3D(float cellSize = 4.0f) : m_cellSize(cellSize) {}

        void clear() { m_buckets.clear(); }

        void insert(uint32_t enemyIndex, const Vec3& pos) {
            int64_t key = computeKey(pos.x, pos.z);
            m_buckets[key].push_back(enemyIndex);
        }

        void queryRadius(const Vec3& center, float radius, std::vector<uint32_t>& outIndices) const {
            int minX = static_cast<int>(std::floor((center.x - radius) / m_cellSize));
            int maxX = static_cast<int>(std::floor((center.x + radius) / m_cellSize));
            int minZ = static_cast<int>(std::floor((center.z - radius) / m_cellSize));
            int maxZ = static_cast<int>(std::floor((center.z + radius) / m_cellSize));

            for (int gx = minX; gx <= maxX; ++gx) {
                for (int gz = minZ; gz <= maxZ; ++gz) {
                    int64_t key = (static_cast<int64_t>(gx) << 32) ^ (static_cast<uint32_t>(gz));
                    auto it = m_buckets.find(key);
                    if (it != m_buckets.end()) {
                        outIndices.insert(outIndices.end(), it->second.begin(), it->second.end());
                    }
                }
            }
        }

    private:
        float m_cellSize;
        std::unordered_map<int64_t, std::vector<uint32_t>> m_buckets;

        int64_t computeKey(float x, float z) const {
            int gx = static_cast<int>(std::floor(x / m_cellSize));
            int gz = static_cast<int>(std::floor(z / m_cellSize));
            return (static_cast<int64_t>(gx) << 32) ^ (static_cast<uint32_t>(gz));
        }
    };

    class AetherSurvivorSimulation {
    public:
        AetherSurvivorSimulation();
        void stepSimulation(float dt);
        bool upgradeBuilding(BuildingType type);
        void spawnWave(int waveNumber);

        Vec3 playerPos{0.0f, 0.0f, 4.0f};
        float playerHp = 2500.0f;
        float playerMaxHp = 2500.0f;
        float playerMoveSpeed = 9.5f;
        float magnetRadius = 5.5f;
        int orbitalBladeCount = 3;
        float orbitalAngle = 0.0f;

        uint64_t goldCoins = 250;
        uint64_t playerXp = 0;
        int playerRunLevel = 1;
        int currentWave = 1;

        std::vector<BaseBuildingPad> buildings;
        std::vector<Enemy3D> enemies;
        std::vector<LootDrop3D> lootDrops;
        std::vector<Projectile3D> projectiles;

    private:
        SpatialHashGrid3D m_grid{4.0f};
        uint32_t m_nextEnemyId = 1;
    };

} // namespace AetherEngine3D
