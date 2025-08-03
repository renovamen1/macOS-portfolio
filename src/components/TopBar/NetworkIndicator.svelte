<script lang="ts">
	import { sineIn } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { click_outside, elevation, focus_outside } from '🍎/actions';
	import { fade_out } from '🍎/helpers/fade.ts';

	let visible = $state(false);
	let networkState = $state({
		connected: true,
		signalStrength: 3, // 0-4 bars
		networkName: 'Home WiFi',
		ipAddress: '192.168.1.42',
		type: 'wifi' as 'wifi' | 'ethernet' | 'cellular' | 'offline'
	});

	function show() {
		visible = true;
	}

	function hide() {
		visible = false;
	}

	function getNetworkIcon() {
		if (!networkState.connected) return '📵';
		
		switch (networkState.type) {
			case 'wifi':
				// Return different WiFi icons based on signal strength
				if (networkState.signalStrength >= 4) return '📶';
				if (networkState.signalStrength >= 3) return '📶';
				if (networkState.signalStrength >= 2) return '📶';
				if (networkState.signalStrength >= 1) return '📶';
				return '📶';
			case 'ethernet':
				return '🔌';
			case 'cellular':
				return '📱';
			default:
				return '📵';
		}
	}

	function toggleConnection() {
		networkState.connected = !networkState.connected;
		if (!networkState.connected) {
			networkState.signalStrength = 0;
		} else {
			networkState.signalStrength = 3;
		}
	}

	// Mock network scanning
	const availableNetworks = [
		{ name: 'Home WiFi', secured: true, signalStrength: 4, connected: true },
		{ name: 'Neighbor WiFi', secured: true, signalStrength: 2, connected: false },
		{ name: 'Public WiFi', secured: false, signalStrength: 3, connected: false },
		{ name: 'Coffee Shop', secured: true, signalStrength: 1, connected: false },
	];
</script>

<div class="container" use:click_outside={hide} use:focus_outside={hide}>
	<button class="network-button" onclick={show} onfocus={show}>
		<span class="network-icon" class:connected={networkState.connected}>
			{getNetworkIcon()}
		</span>
	</button>

	{#if visible}
		<div
			in:fade={{ easing: sineIn, duration: 150 }}
			out:fade_out
			class="network-menu"
			use:elevation={'menubar-menu-parent'}
		>
			<div class="network-header">
				<h3>Wi-Fi</h3>
				<label class="wifi-toggle">
					<input 
						type="checkbox" 
						bind:checked={networkState.connected}
						onchange={toggleConnection}
					/>
					<span class="toggle-slider"></span>
				</label>
			</div>

			{#if networkState.connected}
				<div class="current-network">
					<div class="network-info">
						<div class="network-name">{networkState.networkName}</div>
						<div class="network-details">
							<span class="signal">Signal: {networkState.signalStrength}/4 bars</span>
							<span class="ip">IP: {networkState.ipAddress}</span>
						</div>
					</div>
					<div class="network-status">
						<span class="status-icon">✓</span>
					</div>
				</div>

				<div class="network-divider"></div>

				<div class="available-networks">
					<div class="networks-header">Other Networks</div>
					{#each availableNetworks as network}
						<button class="network-item" class:connected={network.connected}>
							<div class="network-item-info">
								<div class="network-item-name">{network.name}</div>
								<div class="network-item-details">
									{#if network.secured}
										<span class="security">🔒</span>
									{/if}
									<span class="signal-bars">
										{'█'.repeat(network.signalStrength)}{'░'.repeat(4 - network.signalStrength)}
									</span>
								</div>
							</div>
							{#if network.connected}
								<span class="connected-icon">✓</span>
							{/if}
						</button>
					{/each}
				</div>

				<div class="network-divider"></div>

				<div class="network-actions">
					<button class="action-button">Network Preferences...</button>
				</div>
			{:else}
				<div class="offline-message">
					<p>Wi-Fi is turned off</p>
					<button class="action-button" onclick={toggleConnection}>Turn Wi-Fi On</button>
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

	.network-button {
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

	.network-icon {
		font-size: 1rem;
		opacity: 0.7;
		
		&.connected {
			opacity: 1;
		}
	}

	.network-menu {
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
		
		min-width: 300px;
		padding: 1rem;
	}

	.network-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.network-header h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		color: var(--system-color-dark);
	}

	.wifi-toggle {
		position: relative;
		display: inline-block;
		width: 44px;
		height: 24px;
	}

	.wifi-toggle input {
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

	.current-network {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background-color: hsla(var(--system-color-primary-hsl), 0.1);
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.network-info {
		flex: 1;
	}

	.network-name {
		font-weight: 600;
		color: var(--system-color-dark);
		margin-bottom: 0.25rem;
	}

	.network-details {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		font-size: 0.8rem;
		color: var(--system-color-dark);
		opacity: 0.7;
	}

	.network-status .status-icon {
		color: var(--system-color-primary);
		font-weight: bold;
	}

	.network-divider {
		height: 1px;
		background-color: hsla(var(--system-color-dark-hsl), 0.1);
		margin: 0.75rem 0;
	}

	.available-networks {
		margin-bottom: 1rem;
	}

	.networks-header {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--system-color-dark);
		opacity: 0.8;
		margin-bottom: 0.5rem;
	}

	.network-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0.5rem;
		background-color: transparent;
		border-radius: 0.25rem;
		text-align: left;
		
		&:hover {
			background-color: hsla(var(--system-color-dark-hsl), 0.05);
		}
		
		&.connected {
			background-color: hsla(var(--system-color-primary-hsl), 0.1);
		}
	}

	.network-item-info {
		flex: 1;
	}

	.network-item-name {
		font-weight: 500;
		color: var(--system-color-dark);
		margin-bottom: 0.1rem;
	}

	.network-item-details {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--system-color-dark);
		opacity: 0.7;
	}

	.signal-bars {
		font-family: monospace;
		font-size: 0.7rem;
	}

	.connected-icon {
		color: var(--system-color-primary);
		font-weight: bold;
	}

	.network-actions {
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

	.offline-message {
		text-align: center;
		padding: 2rem 1rem;
	}

	.offline-message p {
		color: var(--system-color-dark);
		opacity: 0.7;
		margin-bottom: 1rem;
	}
</style>