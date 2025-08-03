<script lang="ts">
	import { sineIn } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { click_outside, elevation, focus_outside } from '🍎/actions';
	import { fade_out } from '🍎/helpers/fade.ts';
	import { battery_state, formatBatteryTime, getBatteryIcon } from '🍎/state/battery.svelte.ts';

	let visible = $state(false);

	function show() {
		visible = true;
	}

	function hide() {
		visible = false;
	}

	function toggleCharging() {
		// For demo purposes - toggle charging state
		battery_state.charging = !battery_state.charging;
	}

	$: batteryPercentage = battery_state.level;
	$: isCharging = battery_state.charging;
	$: timeRemaining = isCharging ? battery_state.chargingTime : battery_state.dischargingTime;
</script>

<div class="container" use:click_outside={hide} use:focus_outside={hide}>
	<button class="battery-button" onclick={show} onfocus={show}>
		<div class="battery-icon" class:charging={isCharging} class:low={batteryPercentage <= 20}>
			<div class="battery-body">
				<div class="battery-level" style:width="{batteryPercentage}%"></div>
			</div>
			<div class="battery-tip"></div>
			{#if isCharging}
				<div class="charging-bolt">⚡</div>
			{/if}
		</div>
		<span class="battery-text">{batteryPercentage}%</span>
	</button>

	{#if visible}
		<div
			in:fade={{ easing: sineIn, duration: 150 }}
			out:fade_out
			class="battery-menu"
			use:elevation={'menubar-menu-parent'}
		>
			<div class="battery-details">
				<div class="battery-header">
					<div class="large-battery-icon" class:charging={isCharging} class:low={batteryPercentage <= 20}>
						<div class="battery-body">
							<div class="battery-level" style:width="{batteryPercentage}%"></div>
						</div>
						<div class="battery-tip"></div>
						{#if isCharging}
							<div class="charging-bolt large">⚡</div>
						{/if}
					</div>
					<div class="battery-info">
						<h3>{batteryPercentage}%</h3>
						<p class="status">
							{#if isCharging}
								{#if batteryPercentage >= 100}
									Charged
								{:else}
									Charging - {formatBatteryTime(timeRemaining)} until full
								{/if}
							{:else}
								{formatBatteryTime(timeRemaining)} remaining
							{/if}
						</p>
					</div>
				</div>

				<div class="battery-options">
					<button class="option-button" onclick={toggleCharging}>
						{isCharging ? 'Unplug Charger' : 'Plug in Charger'} (Demo)
					</button>
					
					<div class="power-source">
						<span class="label">Power Source:</span>
						<span class="value">{isCharging ? 'Power Adapter' : 'Battery'}</span>
					</div>

					{#if batteryPercentage <= 20}
						<div class="low-power-mode">
							<label>
								<input type="checkbox" />
								Low Power Mode
							</label>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.container {
		position: relative;
		height: 100%;
	}

	.battery-button {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		height: 100%;
		padding: 0 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--system-color-light-contrast);
		
		&:hover {
			background-color: hsla(0, 0%, 96%, 0.2);
		}
	}

	.battery-icon {
		position: relative;
		display: flex;
		align-items: center;
		width: 24px;
		height: 12px;
	}

	.large-battery-icon {
		position: relative;
		display: flex;
		align-items: center;
		width: 32px;
		height: 16px;
	}

	.battery-body {
		width: 20px;
		height: 10px;
		border: 1.5px solid var(--system-color-light-contrast);
		border-radius: 2px;
		position: relative;
		overflow: hidden;
	}

	.large-battery-icon .battery-body {
		width: 26px;
		height: 14px;
		border: 2px solid var(--system-color-light-contrast);
		border-radius: 3px;
	}

	.battery-level {
		height: 100%;
		background-color: var(--system-color-light-contrast);
		transition: width 0.3s ease;
	}

	.battery-tip {
		width: 2px;
		height: 6px;
		background-color: var(--system-color-light-contrast);
		border-radius: 0 1px 1px 0;
		margin-left: 1px;
	}

	.large-battery-icon .battery-tip {
		width: 3px;
		height: 8px;
		border-radius: 0 2px 2px 0;
	}

	.charging-bolt {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		font-size: 8px;
		color: var(--system-color-light-contrast);
		z-index: 1;
	}

	.charging-bolt.large {
		font-size: 12px;
	}

	.battery-icon.charging .battery-level {
		background-color: #34d399;
	}

	.battery-icon.low .battery-level {
		background-color: #ef4444;
	}

	.battery-text {
		font-family: var(--system-font-family);
		letter-spacing: 0.3px;
	}

	.battery-menu {
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
		
		min-width: 280px;
		padding: 1rem;
	}

	.battery-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.battery-header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.battery-info h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		color: var(--system-color-dark);
	}

	.battery-info .status {
		font-size: 0.9rem;
		color: var(--system-color-dark);
		opacity: 0.8;
		margin: 0.2rem 0 0;
	}

	.battery-options {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.option-button {
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

	.power-source {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.9rem;
		color: var(--system-color-dark);
	}

	.power-source .label {
		opacity: 0.8;
	}

	.power-source .value {
		font-weight: 500;
	}

	.low-power-mode {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--system-color-dark);
	}

	.low-power-mode input[type="checkbox"] {
		width: 1rem;
		height: 1rem;
		accent-color: var(--system-color-primary);
	}
</style>