import { persisted } from './persisted.svelte.ts';

interface BatteryInfo {
	level: number; // 0-100
	charging: boolean;
	chargingTime: number; // seconds
	dischargingTime: number; // seconds
}

// Mock battery state for web simulation since real battery API has limited browser support
export const battery_state = $state({
	level: 85,
	charging: false,
	chargingTime: Infinity,
	dischargingTime: 14400, // 4 hours in seconds
	isSupported: false,
});

// Initialize battery API if available
async function initBattery() {
	if ('getBattery' in navigator) {
		try {
			const battery = await (navigator as any).getBattery();
			battery_state.isSupported = true;
			
			// Update initial values
			updateBatteryInfo(battery);
			
			// Set up event listeners
			battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
			battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
			battery.addEventListener('chargingtimechange', () => updateBatteryInfo(battery));
			battery.addEventListener('dischargingtimechange', () => updateBatteryInfo(battery));
		} catch (error) {
			console.log('Battery API not supported, using mock data');
			startMockBattery();
		}
	} else {
		console.log('Battery API not supported, using mock data');
		startMockBattery();
	}
}

function updateBatteryInfo(battery: any) {
	battery_state.level = Math.round(battery.level * 100);
	battery_state.charging = battery.charging;
	battery_state.chargingTime = battery.chargingTime;
	battery_state.dischargingTime = battery.dischargingTime;
}

// Mock battery simulation for demonstration
function startMockBattery() {
	setInterval(() => {
		if (battery_state.charging) {
			battery_state.level = Math.min(100, battery_state.level + 1);
			if (battery_state.level >= 100) {
				battery_state.charging = false;
			}
		} else {
			battery_state.level = Math.max(0, battery_state.level - 0.1);
			if (battery_state.level <= 20) {
				battery_state.charging = true;
			}
		}
	}, 30000); // Update every 30 seconds
}

// Format time remaining
export function formatBatteryTime(seconds: number): string {
	if (!isFinite(seconds) || seconds <= 0) return '--';
	
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	
	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}`;
	}
	return `${minutes} min`;
}

// Get battery icon based on level and charging status
export function getBatteryIcon(level: number, charging: boolean): string {
	if (charging) return '🔋'; // Charging icon
	
	if (level > 75) return '🔋'; // Full
	if (level > 50) return '🔋'; // High
	if (level > 25) return '🪫'; // Medium
	return '🪫'; // Low
}

// Initialize on module load
initBattery();