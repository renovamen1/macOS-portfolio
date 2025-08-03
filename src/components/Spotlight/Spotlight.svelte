<script lang="ts">
	import { apps_config } from '🍎/configs/apps/apps-config';
	import { apps } from '🍎/state/apps.svelte';
	import { spotlight_click_outside } from '🍎/actions/spotlight-click-outside';

	interface SpotlightProps {
		toggleSpotlight: () => void;
		btnRef: HTMLElement;
	}

	const { toggleSpotlight, btnRef }: SpotlightProps = $props();

	let spotlightRef: HTMLDivElement;
	let inputRef: HTMLInputElement;

	let selectedIndex = $state(0);
	let searchText = $state('');

	// Mock data for different result categories
	const photosFromApps = [
		{ id: 'photo1', title: 'Dim Sum Basket', img: '/app-icons/finder/256.png' },
		{ id: 'photo2', title: 'Steamed Dumplings', img: '/app-icons/calculator/256.png' },
		{ id: 'photo3', title: 'Roasted Vegetables', img: '/app-icons/calendar/256.png' },
		{ id: 'photo4', title: 'Scallop Gratin', img: '/app-icons/vscode/256.png' },
		{ id: 'photo5', title: 'Fruit Salad', img: '/app-icons/appstore/256.png' }
	];

	const documents = [
		{ id: 'doc1', title: 'The Recipe with Kenji and Deb', subtitle: 'Deb Perelman & J. Kenji López-Alt', img: '/app-icons/notes/256.png' }
	];

	const relatedSearches = [
		{ id: 'search1', title: 'Search the Web', img: '/app-icons/safari/256.png' }
	];

	const APPS: { [key: string]: any[] } = {
		app: Object.entries(apps_config).map(([id, config]) => ({
			id,
			title: config.title,
			img: `/app-icons/${id}/256.png`,
			type: 'app'
		}))
	};

	const search = (type: string) => {
		if (searchText === '') return [];

		const text = searchText.toLowerCase();
		return APPS[type].filter(
			(item: any) =>
				item.title.toLowerCase().includes(text) || item.id.toLowerCase().includes(text)
		);
	};

	const handleClick = (id: string, type: string) => {
		if (type === 'app') {
			apps.open[id] = true;
			apps.active = id;
			toggleSpotlight();
		} else if (type === 'web') {
			window.open(`https://www.google.com/search?q=${encodeURIComponent(searchText)}`, '_blank');
			toggleSpotlight();
		}
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			toggleSpotlight();
		}
	};

	const handleInputChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		searchText = target.value;
	};

	// Use custom spotlight click outside action
	$effect(() => {
		if (spotlightRef) {
			const cleanup = spotlight_click_outside(spotlightRef, () => {
				toggleSpotlight();
			});
			return cleanup.destroy;
		}
	});
</script>

<div
	class="spotlight-container"
	onkeydown={handleKeyPress}
	onclick={() => inputRef?.focus()}
	bind:this={spotlightRef}
>
	<div class="spotlight-search-bar">
		<div class="search-icon">
			<span class="i-bx:search"></span>
		</div>
		<input
			bind:this={inputRef}
			class="search-input"
			placeholder="Spotlight Search"
			bind:value={searchText}
			oninput={handleInputChange}
			autofocus={true}
		/>
	</div>
	
	{#if searchText !== ''}
		<div class="search-results">
			<!-- Photos From Apps Section -->
			<div class="results-section">
				<div class="section-header">
					<span class="section-title">Photos From Apps</span>
					<a href="#" class="show-more">Show More ></a>
				</div>
				<div class="photos-grid">
					{#each photosFromApps as photo}
						<div class="photo-item" onclick={() => handleClick(photo.id, 'photo')}>
							<img src={photo.img} alt={photo.title} title={photo.title} />
						</div>
					{/each}
				</div>
			</div>

			<!-- Documents Section -->
			<div class="results-section">
				<div class="section-title">Documents</div>
				{#each documents as doc}
					<div class="result-item" onclick={() => handleClick(doc.id, 'document')}>
						<div class="item-icon">
							<img src={doc.img} alt={doc.title} title={doc.title} />
						</div>
						<div class="item-content">
							<div class="item-title">{doc.title}</div>
							<div class="item-subtitle">{doc.subtitle}</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Related Searches Section -->
			<div class="results-section">
				<div class="section-title">Related Searches</div>
				{#each relatedSearches as search}
					<div class="result-item" onclick={() => handleClick(search.id, 'web')}>
						<div class="item-icon">
							<img src={search.img} alt={search.title} title={search.title} />
						</div>
						<div class="item-content">
							<div class="item-title">{search.title}</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Applications Section -->
			{#if search('app').length > 0}
				<div class="results-section">
					<div class="section-title">Applications</div>
					{#each search('app') as app}
						<div class="result-item" onclick={() => handleClick(app.id, 'app')}>
							<div class="item-icon">
								<img src={app.img} alt={app.title} title={app.title} />
							</div>
							<div class="item-content">
								<div class="item-title">{app.title}</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.spotlight-container {
		position: fixed;
		top: 35%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 85vw;
		max-width: 800px;
		z-index: 1000;
		animation: spotlightFadeIn 0.2s ease-out;
	}

	@keyframes spotlightFadeIn {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	.spotlight-search-bar {
		display: flex;
		align-items: center;
		background: rgba(248, 248, 248, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 12px;
		padding: 16px 20px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.2);
		margin-bottom: 8px;
	}

	.search-icon {
		margin-right: 12px;
		color: #666;
		font-size: 20px;
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-size: 18px;
		color: #333;
		font-weight: 500;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.search-input::placeholder {
		color: #999;
		font-weight: normal;
	}

	.search-results {
		background: rgba(248, 248, 248, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.2);
		max-height: 500px;
		overflow-y: auto;
	}

	.results-section {
		padding: 16px 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.results-section:last-child {
		border-bottom: none;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 20px 8px 20px;
	}

	.section-title {
		font-size: 13px;
		font-weight: 600;
		color: #666;
		text-transform: none;
		letter-spacing: 0.3px;
		padding: 0 20px 8px 20px;
	}

	.show-more {
		font-size: 12px;
		color: #007AFF;
		text-decoration: none;
		font-weight: 500;
	}

	.show-more:hover {
		text-decoration: underline;
	}

	.photos-grid {
		display: flex;
		gap: 8px;
		padding: 0 20px;
		overflow-x: auto;
	}

	.photo-item {
		flex-shrink: 0;
		width: 80px;
		height: 80px;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		transition: transform 0.1s ease;
	}

	.photo-item:hover {
		transform: scale(1.05);
	}

	.photo-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.result-item {
		display: flex;
		align-items: center;
		padding: 8px 20px;
		cursor: pointer;
		transition: background-color 0.1s ease;
		border-radius: 6px;
		margin: 0 8px;
	}

	.result-item:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.item-icon {
		width: 32px;
		height: 32px;
		margin-right: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.item-icon img {
		width: 24px;
		height: 24px;
		object-fit: contain;
	}

	.item-content {
		flex: 1;
		min-width: 0;
	}

	.item-title {
		font-size: 14px;
		color: #333;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-subtitle {
		font-size: 12px;
		color: #666;
		margin-top: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Spotlight overlay */
	.spotlight-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(2px);
		z-index: 999;
		animation: overlayFadeIn 0.2s ease-out;
	}

	@keyframes overlayFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>