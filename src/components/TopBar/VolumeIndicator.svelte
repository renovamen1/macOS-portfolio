<script lang="ts">
	import { sineIn } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { click_outside, elevation, focus_outside } from '🍎/actions';
	import { fade_out } from '🍎/helpers/fade.ts';

	let visible = $state(false);
	let volumeState = $state({
		level: 75, // 0-100
		muted: false,
		outputDevice: 'MacBook Pro Speakers'
	});

	function show() {
		visible = true;
	}

	function hide() {
		visible = false;
	}

	function getVolumeIcon() {
		if (volumeState.muted || volumeState.level === 0) return '🔇';
		if (volumeState.level < 33) return '🔈';
		if (volumeState.level < 66) return '🔉';
		return '🔊';
	}

	function toggleMute() {
		volumeState.muted = !volumeState.muted;
	}

	function setVolume(level: number) {
		volumeState.level = Math.max(0, Math.min(100, level));
		if (volumeState.level > 0) {
			volumeState.muted = false;
		}
	}

	function handleVolumeSlider(event: Event) {
		const target = event.target as HTMLInputElement;
		setVolume(parseInt(target.value));
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			setVolume(volumeState.level + 5);
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			setVolume(volumeState.level - 5);
		} else if (event.key === ' ') {
			event.preventDefault();
			toggleMute();
		}
	}

	// Mock audio devices
	const audioDevices = [
		{ name: 'MacBook Pro Speakers', type: 'built-in', active: true },
		{ name: 'AirPods Pro', type: 'bluetooth', active: false },
		{ name: 'External Speakers', type: 'usb', active: false },
	];

	function selectAudioDevice(device: any) {
		audioDevices.forEach(d => d.active = false);
		device.active = true;
		volumeState.outputDevice = device.name;
	}

	$: displayVolume = volumeState.muted ? 0 : volumeState.level;
</script>

<div class="container" use:click_outside={hide} use:focus_outside={hide}>
	<button class="volume-button" onclick={show} onfocus={show}>
		<span class="volume-icon">
			{getVolumeIcon()}
		</span>
	</button>

	{#if visible}
		<div
			in:fade={{ easing: sineIn, duration: 150 }}
			out:fade_out
			class="volume-menu"
			use:elevation={'menubar-menu-parent'}
			onkeydown={handleKeydown}
			tabindex="-1"
		>
			<div class="volume-header">
				<h3>Volume</h3>
				<span class="volume-percentage">{displayVolume}%</span>
			</div>

			<div class="volume-control">
				<button class="mute-button" onclick={toggleMute}>
					<span class="mute-icon">{getVolumeIcon()}</span>
				</button>
				
				<div class="volume-slider-container">
					<input
						type="range"
						min="0"
						max="100"
						value={volumeState.level}
						class="volume-slider"
						oninput={handleVolumeSlider}
						disabled={volumeState.muted}
					/>
					<div class="volume-track">
						<div 
							class="volume-fill" 
							style:width="{displayVolume}%"
							class:muted={volumeState.muted}
						></div>
					</div>
				</div>
			</div>

			<div class="volume-divider"></div>

			<div class="output-section">
				<div class="output-header">Output Device</div>
				<div class="current-output">
					<span class="output-name">{volumeState.outputDevice}</span>
				</div>

				<div class="device-list">
					{#each audioDevices as device}
						<button 
							class="device-item" 
							class:active={device.active}
							onclick={() => selectAudioDevice(device)}
						>
							<div class="device-info">
								<div class="device-name">{device.name}</div>
								<div class="device-type">
									{#if device.type === 'built-in'}
										Built-in
									{:else if device.type === 'bluetooth'}
										Bluetooth
									{:else if device.type === 'usb'}
										USB
									{:else}
										{device.type}
									{/if}
								</div>
							</div>
							{#if device.active}
								<span class="active-indicator">✓</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<div class="volume-divider"></div>

			<div class="volume-actions">
				<button class="action-button">Sound Preferences...</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.container {
		position: relative;
		height: 100%;
	}

	.volume-button {
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

	.volume-icon {
		font-size: 1rem;
	}

	.volume-menu {
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
		outline: none;
	}

	.volume-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.volume-header h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		color: var(--system-color-dark);
	}

	.volume-percentage {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--system-color-dark);
		opacity: 0.8;
	}

	.volume-control {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.mute-button {
		padding: 0.5rem;
		border-radius: 0.25rem;
		background-color: transparent;
		color: var(--system-color-dark);
		
		&:hover {
			background-color: hsla(var(--system-color-dark-hsl), 0.1);
		}
	}

	.mute-icon {
		font-size: 1.2rem;
	}

	.volume-slider-container {
		flex: 1;
		position: relative;
		height: 24px;
		display: flex;
		align-items: center;
	}

	.volume-slider {
		width: 100%;
		height: 4px;
		background: transparent;
		outline: none;
		opacity: 0;
		position: absolute;
		cursor: pointer;
		z-index: 2;
		
		&::-webkit-slider-thumb {
			appearance: none;
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: var(--system-color-primary);
			cursor: pointer;
		}
		
		&::-moz-range-thumb {
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: var(--system-color-primary);
			cursor: pointer;
			border: none;
		}
	}

	.volume-track {
		position: absolute;
		width: 100%;
		height: 4px;
		background-color: hsla(var(--system-color-dark-hsl), 0.2);
		border-radius: 2px;
		overflow: hidden;
	}

	.volume-fill {
		height: 100%;
		background-color: var(--system-color-primary);
		border-radius: 2px;
		transition: width 0.1s ease;
		
		&.muted {
			background-color: hsla(var(--system-color-dark-hsl), 0.4);
		}
	}

	.volume-divider {
		height: 1px;
		background-color: hsla(var(--system-color-dark-hsl), 0.1);
		margin: 0.75rem 0;
	}

	.output-section {
		margin-bottom: 1rem;
	}

	.output-header {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--system-color-dark);
		opacity: 0.8;
		margin-bottom: 0.5rem;
	}

	.current-output {
		padding: 0.5rem;
		background-color: hsla(var(--system-color-primary-hsl), 0.1);
		border-radius: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.output-name {
		font-weight: 500;
		color: var(--system-color-dark);
	}

	.device-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.device-item {
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
		
		&.active {
			background-color: hsla(var(--system-color-primary-hsl), 0.1);
		}
	}

	.device-info {
		flex: 1;
	}

	.device-name {
		font-weight: 500;
		color: var(--system-color-dark);
		margin-bottom: 0.1rem;
	}

	.device-type {
		font-size: 0.8rem;
		color: var(--system-color-dark);
		opacity: 0.7;
	}

	.active-indicator {
		color: var(--system-color-primary);
		font-weight: bold;
	}

	.volume-actions {
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
</style>