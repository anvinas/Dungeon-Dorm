    const { rollAttack } = require('../fight/fightController');

    describe('rollAttack', () => {
    it('should return a miss if attackTotal is less than defenseTotal and not a crit', () => {
        // Mock attacker and defender objects
        const attacker = {
        toObject: () => ({
            stats: { strength: 10, dexterity: 5, intelligence: 5, charisma: 5, defense: 5 },
            gamerTag: 'Attacker'
        })
        };
        const defender = {
        toObject: () => ({
            stats: { strength: 5, dexterity: 5, intelligence: 5, charisma: 5, defense: 20 },
            gamerTag: 'Defender'
        })
        };

        // Mock Math.random to control dice rolls
        jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.1); // d20=3, d10=2

        const result = rollAttack(attacker, defender);

        expect(result.hit).toBe(false);
        expect(result.damage).toBe(0);

        // Restore Math.random
        global.Math.random.mockRestore();
    });

    it('should return a crit if d20 is 20', () => {
        const attacker = {
        toObject: () => ({
            stats: { strength: 10, dexterity: 5, intelligence: 5, charisma: 5, defense: 5 },
            gamerTag: 'Attacker'
        })
        };
        const defender = {
        toObject: () => ({
            stats: { strength: 5, dexterity: 5, intelligence: 5, charisma: 5, defense: 5 },
            gamerTag: 'Defender'
        })
        };

        // Force d20 to 20, d10 to 1
        jest.spyOn(global.Math, 'random')
        .mockReturnValueOnce(0.95) // d20 = 20
        .mockReturnValueOnce(0.05); // d10 = 1

        const result = rollAttack(attacker, defender);

        expect(result.crit).toBe(1);
        expect(result.hit).toBe(1);
        expect(result.damage).toBeGreaterThan(0);

        global.Math.random.mockRestore();
    });
        it('should return correct damage for a normal hit (not crit)', () => {
        const attacker = {
            toObject: () => ({
            stats: { strength: 15, dexterity: 5, intelligence: 5, charisma: 5, defense: 5 },
            gamerTag: 'Attacker'
            })
        };
        const defender = {
            toObject: () => ({
            stats: { strength: 5, dexterity: 5, intelligence: 5, charisma: 5, defense: 5 },
            gamerTag: 'Defender'
            })
        };

        // Force d20 to 15 (not a crit), d10 to 2 (so attackTotal > defenseTotal)
        jest.spyOn(global.Math, 'random')
            .mockReturnValueOnce(0.7) // d20 = 15
            .mockReturnValueOnce(0.1); // d10 = 2

        const result = rollAttack(attacker, defender);

        expect(result.hit).toBe(true);
        expect(result.crit).toBe(0);
        expect(result.damage).toBeGreaterThan(0);

        global.Math.random.mockRestore();
        });
    });