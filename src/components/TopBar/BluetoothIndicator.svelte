<script lang="ts">
	import { sineIn } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { click_outside, elevation, focus_outside } from '🍎/actions';
	import { fade_out } from '🍎/helpers/fade.ts';

	let visible = $state(false);
	let bluetoothState = $state({
		enabled: true,
		discovering: false,
		connectedDevices: [] as Array<{name: string, type: string, battery?: number}>
	});

	function show() {
		visible = true;
	}

	function hide() {
		visible = false;
	}

	function getBluetoothIcon() {
		if (!bluetoothState.enabled) return '📶'; // Disabled Bluetooth
		if (bluetoothState.connectedDevices.length > 0) return '🔵'; // Connected
		return '🔵'; // Enabled but no connections
	}

	function toggleBluetooth() {
		bluetoothState.enabled = !bluetoothState.enabled;
		if (!bluetoothState.enabled) {
			bluetoothState.connectedDevices = [];
			bluetoothState.discovering = false;
		}
	}

	function toggleDiscovery() {
		if (!bluetoothState.enabled) return;
		bluetoothState.discovering = !bluetoothState.discovering;
	}

	// Mock connected devices
	const mockConnectedDevices = [
		{ name: 'AirPods Pro', type: 'headphones', battery: 85 },
		{ name: 'Magic Mouse', type: 'mouse', battery: 42 },
		{ name: 'iPad Pro', type: 'tablet' },
	];

	// Mock available devices for pairing
	const availableDevices = [
		{ name: 'iPhone 13', type: 'phone', paired: false },
		{ name: 'Apple Watch', type: 'watch', paired: false },
		{ name: 'MacBook Air', type: 'computer', paired: false },
	];

	function connectDevice(device: any) {
		if (!bluetoothState.enabled) return;
		// Mock connection logic
		bluetoothState.connectedDevices = [...bluetoothState.connectedDevices, device];
	}

	function disconnectDevice(deviceName: string) {
		bluetoothState.connectedDevices = bluetoothState.connectedDevices.filter(
			device => device.name !== deviceName
		);
	}

	// Initialize with some connected devices if enabled
	$effect(() => {
		if (bluetoothState.enabled && bluetoothState.connectedDevices.length === 0) {
			bluetoothState.connectedDevices = [...mockConnectedDevices];
		}
	});
</script>

<div class="container" use:click_outside={hide} use:focus_outside={hide}>
	<button class="bluetooth-button" onclick={show} onfocus={show}>
		<span class="bluetooth-icon" class:enabled={bluetoothState.enabled}>
			{getBluetoothIcon()}
		</span>
	</button>

	{#if visible}
		<div
			in:fade={{ easing: sineIn, duration: 150 }}
			out:fade_out
			class="bluetooth-menu"
			use:elevation={'menubar-menu-parent'}
		>
			<div class="bluetooth-header">
				<h3>Bluetooth</h3>
				<label class="bluetooth-toggle">
					<input 
						type="checkbox" 
						bind:checked={bluetoothState.enabled}
						onchange={toggleBluetooth}
					/>
					<span class="toggle-slider"></span>
				</label>
			</div>

			{#if bluetoothState.enabled}
				{#if bluetoothState.connectedDevices.length > 0}
					<div class="connected-section">
						<div class="section-header">Connected Devices</div>
						{#each bluetoothState.connectedDevices as device}
							<div class="device-item connected">
								<div class="device-info">
									<div class="device-name">{device.name}</div>
									<div class="device-details">
										<span class="device-type">{device.type}</span>
										{#if device.battery}
											<span class="battery-level">🔋 {device.battery}%</span>
										{/if}
									</div>
								</div>
								<div class="device-actions">
									<button 
										class="disconnect-button"
										onclick={() => disconnectDevice(device.name)}
									>
										Disconnect
									</button>
								</div>
							</div>
						{/each}
					</div>

					<div class="bluetooth-divider"></div>
				{/if}

				<div class="discovery-section">
					<div class="discovery-header">
						<span>Nearby Devices</span>
						<button 
							class="discovery-button" 
							class:active={bluetoothState.discovering}
							onclick={toggleDiscovery}
						>
							{bluetoothState.discovering ? 'Stop Scan' : 'Scan'}
						</button>
					</div>

					{#if bluetoothState.discovering}
						<div class="scanning-indicator">
							<span class="scanning-text">Scanning for devices...</span>
							<div class="scanning-animation">🔍</div>
						</div>
					{/if}

					<div class="available-devices">
						{#each availableDevices as device}
							<button 
								class="device-item available"
								onclick={() => connectDevice(device)}
								disabled={!bluetoothState.discovering}
							>
								<div class="device-info">
									<div class="device-name">{device.name}</div>
									<div class="device-type">{device.type}</div>
								</div>
								<div class="pair-button">
									{device.paired ? 'Connected' : 'Pair'}
								</div>
							</button>
						{/each}
					</div>
				</div>

				<div class="bluetooth-divider"></div>

				<div class="bluetooth-actions">
					<button class="action-button">Bluetooth Preferences...</button>
				</div>
			{:else}
				<div class="bluetooth-disabled">
					<p>Bluetooth is turned off</p>
					<p class="disabled-description">
						Turn on Bluetooth to connect to devices like headphones, keyboards, and mice.
					</p>
					<button class="action-button" onclick={toggleBluetooth}>
						Turn Bluetooth On
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.container {
		position: relative;
		height: 100%;
	}

	.bluetooth-button {
		display: flex;
		align-items: center;
		height: 100%;
		padding: 0 0.5rem;
		border-radius: 0.25rem;
		color: var(--system-color-light-contrast);
		
		&:hover {
			background-color: hsla(0, 0%, 96%, 0.2);
		}
	}

	.bluetooth-icon {
		font-size: 1rem;
		opacity: 0.5;
		
		&.enabled {
			opacity: 1;
		}
	}

	.bluetooth-menu {
		position: absolute;
		right: 0;
		top: 100%;
		margin-top: 7px;
		z-index: 1000;
		
		background-color: hsla(var(--system-color-light-hsl), 0.9);
		border-radius: 0.75rem;
		box-shadow: 
			hsla(0, 0%, 0%, 0.3) 0px 0px 11px 0px,
			inset 0 0 0 0.5px hsla(var(--system-color-dark-hsl), 0.2);
		backdrop-filter: blur(12px);
		
		min-width: 320px;
		padding: 1rem;
	}

	.bluetooth-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.bluetooth-header h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		color: var(--system-color-dark);
	}

	.bluetooth-toggle {
		position: relative;
		display: inline-block;
		width: 44px;
		height: 24px;
	}

	.bluetooth-toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		border-radius: 24px;
		transition: 0.3s;
	}

	.toggle-slider:before {
		position: absolute;
		content: "";
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		border-radius: 50%;
		transition: 0.3s;
	}

	input:checked + .toggle-slider {
		background-color: var(--system-color-primary);
	}

	input:checked + .toggle-slider:before {
		transform: translateX(20px);
	}

	.connected-section {
		margin-bottom: 1rem;
	}

	.section-header {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--system-color-dark);
		opacity: 0.8;
		margin-bottom: 0.5rem;
	}

	.device-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		border-radius: 0.5rem;
		margin-bottom: 0.5rem;
		
		&.connected {
			background-color: hsla(var(--system-color-primary-hsl), 0.1);
			border: 1px solid hsla(var(--system-color-primary-hsl), 0.2);
		}
		
		&.available {
			background-color: transparent;
			border: 1px solid hsla(var(--system-color-dark-hsl), 0.1);
			cursor: pointer;
			
			&:hover:not(:disabled) {
				background-color: hsla(var(--system-color-dark-hsl), 0.05);
			}
			
			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}
	}

	.device-info {
		flex: 1;
	}

	.device-name {
		font-weight: 500;
		color: var(--system-color-dark);
		margin-bottom: 0.2rem;
	}

	.device-details {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.device-type {
		font-size: 0.8rem;
		color: var(--system-color-dark);
		opacity: 0.7;
		text-transform: capitalize;
	}

	.battery-level {
		font-size: 0.8rem;
		color: var(--system-color-primary);
		font-weight: 500;
	}

	.device-actions {
		display: flex;
		gap: 0.5rem;
	}

	.disconnect-button {
		padding: 0.25rem 0.5rem;
		background-color: hsla(var(--system-color-dark-hsl), 0.1);
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.2);
		border-radius: 0.25rem;
		color: var(--system-color-dark);
		font-size: 0.8rem;
		
		&:hover {
			background-color: hsla(var(--system-color-dark-hsl), 0.2);
		}
	}

	.pair-button {
		padding: 0.25rem 0.5rem;
		background-color: var(--system-color-primary);
		color: var(--system-color-primary-contrast);
		border-radius: 0.25rem;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.bluetooth-divider {
		height: 1px;
		background-color: hsla(var(--system-color-dark-hsl), 0.1);
		margin: 0.75rem 0;
	}

	.discovery-section {
		margin-bottom: 1rem;
	}

	.discovery-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--system-color-dark);
		opacity: 0.8;
	}

	.discovery-button {
		padding: 0.25rem 0.5rem;
		background-color: hsla(var(--system-color-primary-hsl), 0.1);
		border: 1px solid hsla(var(--system-color-primary-hsl), 0.3);
		border-radius: 0.25rem;
		color: var(--system-color-primary);
		font-size: 0.8rem;
		font-weight: 500;
		
		&:hover {
			background-color: hsla(var(--system-color-primary-hsl), 0.2);
		}
		
		&.active {
			background-color: var(--system-color-primary);
			color: var(--system-color-primary-contrast);
		}
	}

	.scanning-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background-color: hsla(var(--system-color-primary-hsl), 0.05);
		border-radius: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.scanning-text {
		font-size: 0.9rem;
		color: var(--system-color-dark);
		opacity: 0.8;
	}

	.scanning-animation {
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.available-devices {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.bluetooth-actions {
		text-align: center;
	}

	.action-button {
		padding: 0.5rem 1rem;
		background-color: hsla(var(--system-color-primary-hsl), 0.1);
		border: 1px solid hsla(var(--system-color-primary-hsl), 0.3);
		border-radius: 0.5rem;
		color: var(--system-color-primary);
		font-size: 0.9rem;
		font-weight: 500;
		
		&:hover {
			background-color: hsla(var(--system-color-primary-hsl), 0.2);
		}
	}

	.bluetooth-disabled {
		text-align: center;
		padding: 2rem 1rem;
	}

	.bluetooth-disabled p {
		color: var(--system-color-dark);
		margin-bottom: 0.5rem;
	}

	.disabled-description {
		font-size: 0.9rem;
		opacity: 0.7;
		margin-bottom: 1.5rem !important;
	}
</style>