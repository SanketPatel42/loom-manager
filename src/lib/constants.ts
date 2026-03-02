
export const APP_CONSTANTS = {
    MACHINES_PER_SHEET: 12,
    TOTAL_SHEETS: 12,
    LOOM_SPEED_RPM: 600, // Default loom speed
    DEFAULT_EFFICIENCY: 85, // Default efficiency percentage
    CURRENCY_SYMBOL: '₹',
    DATE_FORMAT: 'DD/MM/YYYY',
    CYCLES: {
        FIRST_HALF: '1-15',
        SECOND_HALF: '16-30'
    } as const
};
