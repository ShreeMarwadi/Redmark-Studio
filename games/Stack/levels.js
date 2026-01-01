/**
 * EchoStep - Level Data
 * Defines all levels with static terrain, hazards, spawn points, and goals
 * Levels progressively introduce echo mechanics and environmental hazards
 */

const LEVELS = [
    // Level 1: Introduction - Simple platforming
    {
        id: 1,
        name: "First Echo",
        width: 1600,
        height: 900,
        spawn: { x: 100, y: 700 },
        goal: { x: 1400, y: 200, width: 80, height: 120 },
        terrain: [
            // Ground floor
            { x: 0, y: 800, width: 1600, height: 100 },
            // Starting platform
            { x: 50, y: 650, width: 200, height: 20 },
            // Stepping platforms
            { x: 350, y: 550, width: 150, height: 20 },
            { x: 550, y: 450, width: 150, height: 20 },
            { x: 750, y: 350, width: 150, height: 20 },
            // Goal platform
            { x: 1300, y: 320, width: 250, height: 20 }
        ],
        hazards: [
            // Simple hazard that pulses - introduced later in level
        ],
        hint: "Move to create your first echo, then use it to reach higher platforms."
    },

    // Level 2: Echo Introduction - Teaching the mechanic
    {
        id: 2,
        name: "Echo Trail",
        width: 1800,
        height: 900,
        spawn: { x: 100, y: 700 },
        goal: { x: 1600, y: 150, width: 80, height: 120 },
        terrain: [
            // Ground
            { x: 0, y: 800, width: 400, height: 100 },
            // Gap requiring echo jump
            { x: 700, y: 800, width: 400, height: 100 },
            // Stepping up
            { x: 1200, y: 700, width: 200, height: 20 },
            { x: 1450, y: 600, width: 150, height: 20 },
            // Goal platform
            { x: 1550, y: 270, width: 200, height: 20 }
        ],
        hazards: [
            // Pit hazards - fall damage zones
            { x: 400, y: 850, width: 300, height: 50, type: 'pit' }
        ],
        hint: "Create a path across the gap, then use your echo to cross safely."
    },

    // Level 3: Vertical Echo - Building upward
    {
        id: 3,
        name: "Ascending Echo",
        width: 1200,
        height: 1200,
        spawn: { x: 550, y: 1100 },
        goal: { x: 550, y: 50, width: 80, height: 120 },
        terrain: [
            // Ground
            { x: 0, y: 1150, width: 1200, height: 50 },
            // Central tower
            { x: 500, y: 900, width: 200, height: 250 },
            // Left platforms
            { x: 200, y: 750, width: 150, height: 20 },
            { x: 50, y: 550, width: 150, height: 20 },
            { x: 200, y: 350, width: 150, height: 20 },
            // Right platforms
            { x: 850, y: 650, width: 150, height: 20 },
            { x: 1000, y: 450, width: 150, height: 20 },
            { x: 850, y: 250, width: 150, height: 20 },
            // Goal platform
            { x: 500, y: 170, width: 200, height: 20 }
        ],
        hazards: [
            // Side pits
            { x: 0, y: 1150, width: 200, height: 50, type: 'pit' },
            { x: 1000, y: 1150, width: 200, height: 50, type: 'pit' }
        ],
        hint: "Build your echo upward like stairs to reach the summit."
    },

    // Level 4: Rhythm Hazard - Pulsing danger
    {
        id: 4,
        name: "Pulse Warning",
        width: 1600,
        height: 900,
        spawn: { x: 100, y: 700 },
        goal: { x: 1450, y: 200, width: 80, height: 120 },
        terrain: [
            // Ground
            { x: 0, y: 800, width: 1600, height: 100 },
            // Platform sections with gaps
            { x: 0, y: 650, width: 300, height: 20 },
            { x: 450, y: 650, width: 200, height: 20 },
            { x: 800, y: 550, width: 200, height: 20 },
            { x: 1150, y: 450, width: 200, height: 20 },
            // Goal platform
            { x: 1350, y: 320, width: 200, height: 20 }
        ],
        hazards: [
            // Floor hazards that pulse on a pattern
            {
                x: 350, y: 790, width: 50, height: 10,
                type: 'pulse',
                pattern: [0, 0, 1, 1, 0, 0, 1, 1], // Active on beats 2-3, 6-7
                beatOffset: 0
            },
            {
                x: 700, y: 790, width: 50, height: 10,
                type: 'pulse',
                pattern: [1, 1, 0, 0, 1, 1, 0, 0], // Active on beats 0-1, 4-5
                beatOffset: 2
            },
            {
                x: 1050, y: 790, width: 50, height: 10,
                type: 'pulse',
                pattern: [0, 1, 0, 1, 0, 1, 0, 1], // Alternating
                beatOffset: 0
            }
        ],
        hint: "Watch the rhythm. Hazards pulse in patterns - time your movements carefully."
    },

    // Level 5: Echo Bridge - Creating paths over hazards
    {
        id: 5,
        name: "Bridge of Echoes",
        width: 1400,
        height: 900,
        spawn: { x: 100, y: 500 },
        goal: { x: 1250, y: 400, width: 80, height: 120 },
        terrain: [
            // Starting platform
            { x: 0, y: 550, width: 250, height: 350 },
            // Goal platform
            { x: 1150, y: 520, width: 250, height: 380 },
            // Small safety platforms
            { x: 450, y: 500, width: 80, height: 20 },
            { x: 850, y: 500, width: 80, height: 20 }
        ],
        hazards: [
            // Large pit with hazards
            {
                x: 280, y: 850, width: 840, height: 50,
                type: 'pit'
            },
            // Floating hazards in the gap
            {
                x: 550, y: 300, width: 60, height: 60,
                type: 'pulse',
                pattern: [1, 0, 1, 0, 1, 0, 1, 0],
                beatOffset: 0
            },
            {
                x: 800, y: 300, width: 60, height: 60,
                type: 'pulse',
                pattern: [0, 1, 0, 1, 0, 1, 0, 1],
                beatOffset: 0
            }
        ],
        hint: "Create an echo bridge across the gap, avoiding the pulsing dangers."
    },

    // Level 6: Double Echo - Managing two layers
    {
        id: 6,
        name: "Layered Memory",
        width: 1800,
        height: 900,
        spawn: { x: 100, y: 700 },
        goal: { x: 1650, y: 150, width: 80, height: 120 },
        terrain: [
            // Ground
            { x: 0, y: 800, width: 500, height: 100 },
            // First climb
            { x: 250, y: 650, width: 100, height: 20 },
            { x: 400, y: 550, width: 100, height: 20 },
            // Second section (needs double echo)
            { x: 650, y: 800, width: 300, height: 100 },
            { x: 700, y: 650, width: 100, height: 20 },
            { x: 850, y: 550, width: 100, height: 20 },
            // Final climb
            { x: 1100, y: 800, width: 200, height: 100 },
            { x: 1150, y: 650, width: 100, height: 20 },
            { x: 1300, y: 550, width: 100, height: 20 },
            { x: 1450, y: 450, width: 100, height: 20 },
            // Goal
            { x: 1600, y: 270, width: 150, height: 20 }
        ],
        hazards: [
            // Pits between sections
            { x: 500, y: 850, width: 150, height: 50, type: 'pit' },
            { x: 950, y: 850, width: 150, height: 50, type: 'pit' }
        ],
        hint: "Two echoes can coexist. Use your older echo while creating a new one."
    },

    // Level 7: Rhythm Bridge - Sync movement with hazards
    {
        id: 7,
        name: "Synchronized",
        width: 1600,
        height: 900,
        spawn: { x: 100, y: 500 },
        goal: { x: 1450, y: 400, width: 80, height: 120 },
        terrain: [
            // Starting area
            { x: 0, y: 550, width: 300, height: 350 },
            // Bridge sections (hazard between them)
            { x: 350, y: 550, width: 150, height: 20 },
            { x: 550, y: 550, width: 150, height: 20 },
            { x: 750, y: 550, width: 150, height: 20 },
            { x: 950, y: 550, width: 150, height: 20 },
            // Goal area
            { x: 1150, y: 520, width: 400, height: 380 }
        ],
        hazards: [
            // Floor hazards on the bridge sections
            {
                x: 380, y: 540, width: 90, height: 10,
                type: 'pulse',
                pattern: [1, 1, 0, 0, 0, 0, 1, 1],
                beatOffset: 0
            },
            {
                x: 580, y: 540, width: 90, height: 10,
                type: 'pulse',
                pattern: [0, 0, 1, 1, 0, 0, 1, 1],
                beatOffset: 2
            },
            {
                x: 780, y: 540, width: 90, height: 10,
                type: 'pulse',
                pattern: [0, 0, 0, 0, 1, 1, 1, 1],
                beatOffset: 4
            },
            {
                x: 980, y: 540, width: 90, height: 10,
                type: 'pulse',
                pattern: [1, 0, 1, 0, 1, 0, 1, 0],
                beatOffset: 0
            }
        ],
        hint: "The bridge pulses in waves. Create echoes on safe sections to cross."
    },

    // Level 8: Echo Precision - Fine control required
    {
        id: 8,
        name: "Precision Echo",
        width: 1200,
        height: 1000,
        spawn: { x: 100, y: 900 },
        goal: { x: 1050, y: 100, width: 80, height: 120 },
        terrain: [
            // Ground
            { x: 0, y: 950, width: 1200, height: 50 },
            // Narrow path
            { x: 100, y: 850, width: 80, height: 20 },
            { x: 250, y: 750, width: 80, height: 20 },
            { x: 400, y: 650, width: 80, height: 20 },
            { x: 550, y: 550, width: 80, height: 20 },
            { x: 700, y: 450, width: 80, height: 20 },
            { x: 850, y: 350, width: 80, height: 20 },
            // Goal platform
            { x: 1000, y: 220, width: 150, height: 20 }
        ],
        hazards: [
            // Narrow hazard zones below each platform
            { x: 0, y: 980, width: 1200, height: 20, type: 'pit' }
        ],
        hint: "Each echo must be precise. One misstep and you fall."
    },

    // Level 9: The Maze - Complex echo usage
    {
        id: 9,
        name: "Echo Maze",
        width: 2000,
        height: 1200,
        spawn: { x: 100, y: 1100 },
        goal: { x: 1850, y: 150, width: 80, height: 120 },
        terrain: [
            // Ground floor
            { x: 0, y: 1150, width: 2000, height: 50 },
            // First section - lower path
            { x: 100, y: 1000, width: 300, height: 20 },
            { x: 500, y: 1000, width: 300, height: 20 },
            // Second section - middle path
            { x: 200, y: 800, width: 200, height: 20 },
            { x: 500, y: 700, width: 200, height: 20 },
            { x: 800, y: 700, width: 200, height: 20 },
            // Third section - upper path
            { x: 1100, y: 600, width: 200, height: 20 },
            { x: 1400, y: 500, width: 200, height: 20 },
            { x: 1650, y: 400, width: 200, height: 20 },
            // Final section
            { x: 1750, y: 270, width: 200, height: 20 }
        ],
        hazards: [
            // Various pit zones
            { x: 400, y: 1150, width: 100, height: 50, type: 'pit' },
            { x: 800, y: 1150, width: 200, height: 50, type: 'pit' },
            { x: 1100, y: 1150, width: 200, height: 50, type: 'pit' }
        ],
        hint: "Navigate the maze. Your echoes can create shortcuts through the walls."
    },

    // Level 10: Final Challenge - Mastery test
    {
        id: 10,
        name: "Echo Mastery",
        width: 1800,
        height: 1000,
        spawn: { x: 100, y: 850 },
        goal: { x: 1650, y: 100, width: 80, height: 120 },
        terrain: [
            // Starting area
            { x: 0, y: 900, width: 300, height: 100 },
            // Descent into danger
            { x: 100, y: 750, width: 100, height: 20 },
            { x: 250, y: 650, width: 100, height: 20 },
            // Hazard corridor
            { x: 400, y: 650, width: 200, height: 20 },
            { x: 650, y: 600, width: 150, height: 20 },
            // Climb back up
            { x: 850, y: 550, width: 100, height: 20 },
            { x: 1000, y: 450, width: 100, height: 20 },
            { x: 1150, y: 350, width: 100, height: 20 },
            // Final gauntlet
            { x: 1300, y: 350, width: 100, height: 20 },
            { x: 1450, y: 250, width: 100, height: 20 },
            { x: 1600, y: 220, width: 150, height: 20 }
        ],
        hazards: [
            // Challenging pulse patterns
            {
                x: 420, y: 640, width: 160, height: 10,
                type: 'pulse',
                pattern: [1, 1, 1, 0, 0, 0, 1, 1],
                beatOffset: 0
            },
            {
                x: 670, y: 590, width: 110, height: 10,
                type: 'pulse',
                pattern: [0, 0, 1, 1, 0, 0, 1, 1],
                beatOffset: 2
            },
            {
                x: 1320, y: 340, width: 60, height: 10,
                type: 'pulse',
                pattern: [1, 0, 1, 0, 1, 0, 1, 0],
                beatOffset: 0
            },
            {
                x: 1470, y: 240, width: 60, height: 10,
                type: 'pulse',
                pattern: [0, 1, 0, 1, 0, 1, 0, 1],
                beatOffset: 1
            },
            // Fall zones
            { x: 300, y: 950, width: 100, height: 50, type: 'pit' },
            { x: 1250, y: 950, width: 100, height: 50, type: 'pit' }
        ],
        hint: "The ultimate test. Combine all you've learned to reach the summit."
    }
];

// Export for use in game.js
window.LEVELS = LEVELS;
