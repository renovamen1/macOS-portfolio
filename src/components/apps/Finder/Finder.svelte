<script lang="ts">
	import { apps } from '🍎/state/apps.svelte.ts';
	import { onMount } from 'svelte';

	// Finder state
	let currentPath = $state('/Users/Guest');
	let selectedItems = $state<string[]>([]);
	let viewMode = $state<'icons' | 'list' | 'columns'>('icons');
	let sidebarVisible = $state(true);
	let searchQuery = $state('');

	// Mock file system structure
	const fileSystem = {
		'/': {
			name: 'Macintosh HD',
			type: 'folder',
			children: ['Applications', 'System', 'Users', 'Library']
		},
		'/Applications': {
			name: 'Applications',
			type: 'folder',
			children: ['Calculator.app', 'Calendar.app', 'VSCode.app', 'Safari.app']
		},
		'/Users': {
			name: 'Users',
			type: 'folder',
			children: ['Guest', 'Shared']
		},
		'/Users/Guest': {
			name: 'Guest',
			type: 'folder',
			children: ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Movies']
		},
		'/Users/Guest/Desktop': {
			name: 'Desktop',
			type: 'folder',
			children: ['Project.txt', 'Screenshot.png', 'Folder']
		},
		'/Users/Guest/Documents': {
			name: 'Documents',
			type: 'folder',
			children: ['Resume.pdf', 'Notes.txt', 'Presentation.pptx']
		},
		'/Users/Guest/Downloads': {
			name: 'Downloads',
			type: 'folder',
			children: ['installer.dmg', 'photo.jpg', 'document.pdf']
		}
	};

	// Get current directory contents
	$: currentItems = getCurrentItems(currentPath);
	$: filteredItems = searchQuery 
		? currentItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
		: currentItems;

	function getCurrentItems(path: string) {
		const current = fileSystem[path];
		if (!current || !current.children) return [];
		
		return current.children.map(childName => {
			const childPath = path === '/' ? `/${childName}` : `${path}/${childName}`;
			const childData = fileSystem[childPath];
			
			return {
				name: childName,
				path: childPath,
				type: childData?.type || getFileType(childName),
				size: getFileSize(childName),
				modified: new Date(Date.now() - Math.random() * 86400000 * 30).toLocaleDateString()
			};
		});
	}

	function getFileType(name: string): 'folder' | 'file' {
		if (name.includes('.')) return 'file';
		return 'folder';
	}

	function getFileSize(name: string): string {
		if (name.includes('.')) {
			return `${Math.floor(Math.random() * 1000) + 10} KB`;
		}
		return '--';
	}

	function getFileIcon(item: any): string {
		if (item.type === 'folder') return '📁';
		
		const ext = item.name.split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'txt': return '📄';
			case 'pdf': return '📕';
			case 'png': case 'jpg': case 'jpeg': return '🖼️';
			case 'mp3': case 'wav': return '🎵';
			case 'mp4': case 'mov': return '🎬';
			case 'app': return '📱';
			case 'dmg': return '💽';
			case 'pptx': case 'ppt': return '📊';
			default: return '📄';
		}
	}

	function navigateToPath(path: string) {
		currentPath = path;
		selectedItems = [];
	}

	function goBack() {
		const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
		navigateToPath(parentPath);
	}

	function goForward() {
		// Implement forward navigation logic
	}

	function openItem(item: any) {
		if (item.type === 'folder') {
			navigateToPath(item.path);
		} else {
			// Handle file opening
			console.log('Opening file:', item.name);
		}
	}

	function selectItem(item: any, event: MouseEvent) {
		if (event.metaKey || event.ctrlKey) {
			// Multi-select
			if (selectedItems.includes(item.name)) {
				selectedItems = selectedItems.filter(name => name !== item.name);
			} else {
				selectedItems = [...selectedItems, item.name];
			}
		} else {
			selectedItems = [item.name];
		}
	}

	function toggleSidebar() {
		sidebarVisible = !sidebarVisible;
	}

	function changeViewMode(mode: 'icons' | 'list' | 'columns') {
		viewMode = mode;
	}

	// Sidebar items
	const sidebarItems = [
		{ name: 'Favorites', type: 'header' },
		{ name: 'AirDrop', icon: '📡', path: '/airdrop' },
		{ name: 'Recents', icon: '🕒', path: '/recents' },
		{ name: 'Applications', icon: '📱', path: '/Applications' },
		{ name: 'Desktop', icon: '🖥️', path: '/Users/Guest/Desktop' },
		{ name: 'Documents', icon: '📄', path: '/Users/Guest/Documents' },
		{ name: 'Downloads', icon: '⬇️', path: '/Users/Guest/Downloads' },
		{ name: 'iCloud Drive', type: 'header' },
		{ name: 'iCloud Drive', icon: '☁️', path: '/icloud' },
		{ name: 'Locations', type: 'header' },
		{ name: 'Macintosh HD', icon: '💾', path: '/' },
	];

	onMount(() => {
		// Initialize Finder
	});
</script>

<main class="finder-window">
	<div class="finder-toolbar">
		<div class="toolbar-left">
			<button class="toolbar-button" onclick={goBack} disabled={currentPath === '/'}>
				<span class="icon">←</span>
			</button>
			<button class="toolbar-button" onclick={goForward}>
				<span class="icon">→</span>
			</button>
			<button class="toolbar-button" onclick={() => changeViewMode('icons')} class:active={viewMode === 'icons'}>
				<span class="icon">⊞</span>
			</button>
			<button class="toolbar-button" onclick={() => changeViewMode('list')} class:active={viewMode === 'list'}>
				<span class="icon">☰</span>
			</button>
			<button class="toolbar-button" onclick={() => changeViewMode('columns')} class:active={viewMode === 'columns'}>
				<span class="icon">⫼</span>
			</button>
		</div>
		
		<div class="path-bar">
			<span class="path-text">{currentPath}</span>
		</div>
		
		<div class="toolbar-right">
			<div class="search-box">
				<input 
					type="text" 
					placeholder="Search" 
					bind:value={searchQuery}
					class="search-input"
				/>
			</div>
			<button class="toolbar-button" onclick={toggleSidebar}>
				<span class="icon">⋮</span>
			</button>
		</div>
	</div>

	<div class="finder-content">
		{#if sidebarVisible}
			<div class="sidebar">
				{#each sidebarItems as item}
					{#if item.type === 'header'}
						<div class="sidebar-header">{item.name}</div>
					{:else}
						<button 
							class="sidebar-item" 
							class:active={currentPath === item.path}
							onclick={() => navigateToPath(item.path)}
						>
							<span class="sidebar-icon">{item.icon}</span>
							<span class="sidebar-text">{item.name}</span>
						</button>
					{/if}
				{/each}
			</div>
		{/if}

		<div class="main-content">
			{#if viewMode === 'icons'}
				<div class="icons-view">
					{#each filteredItems as item}
						<div 
							class="file-item" 
							class:selected={selectedItems.includes(item.name)}
							onclick={(e) => selectItem(item, e)}
							ondblclick={() => openItem(item)}
						>
							<div class="file-icon">{getFileIcon(item)}</div>
							<div class="file-name">{item.name}</div>
						</div>
					{/each}
				</div>
			{:else if viewMode === 'list'}
				<div class="list-view">
					<div class="list-header">
						<div class="column-header name">Name</div>
						<div class="column-header size">Size</div>
						<div class="column-header modified">Date Modified</div>
					</div>
					{#each filteredItems as item}
						<div 
							class="list-item" 
							class:selected={selectedItems.includes(item.name)}
							onclick={(e) => selectItem(item, e)}
							ondblclick={() => openItem(item)}
						>
							<div class="list-cell name">
								<span class="file-icon small">{getFileIcon(item)}</span>
								<span class="file-name">{item.name}</span>
							</div>
							<div class="list-cell size">{item.size}</div>
							<div class="list-cell modified">{item.modified}</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	.finder-window {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: var(--system-color-light);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.finder-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem;
		background-color: hsla(var(--system-color-light-hsl), 0.8);
		border-bottom: 1px solid hsla(var(--system-color-dark-hsl), 0.1);
		backdrop-filter: blur(12px);
	}

	.toolbar-left,
	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.toolbar-button {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		background-color: transparent;
		color: var(--system-color-dark);
		font-size: 0.9rem;
		
		&:hover:not(:disabled) {
			background-color: hsla(var(--system-color-dark-hsl), 0.1);
		}
		
		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
		
		&.active {
			background-color: var(--system-color-primary);
			color: var(--system-color-primary-contrast);
		}
	}

	.path-bar {
		flex: 1;
		text-align: center;
		font-size: 0.9rem;
		color: var(--system-color-dark);
		opacity: 0.8;
	}

	.search-box {
		position: relative;
	}

	.search-input {
		padding: 0.25rem 0.5rem;
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.2);
		border-radius: 0.25rem;
		background-color: var(--system-color-light);
		color: var(--system-color-dark);
		font-size: 0.9rem;
		width: 150px;
		
		&:focus {
			outline: none;
			border-color: var(--system-color-primary);
		}
	}

	.finder-content {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 200px;
		background-color: hsla(var(--system-color-light-hsl), 0.5);
		border-right: 1px solid hsla(var(--system-color-dark-hsl), 0.1);
		padding: 0.5rem 0;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--system-color-dark);
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.4rem 1rem;
		background-color: transparent;
		color: var(--system-color-dark);
		font-size: 0.9rem;
		text-align: left;
		
		&:hover {
			background-color: hsla(var(--system-color-dark-hsl), 0.05);
		}
		
		&.active {
			background-color: var(--system-color-primary);
			color: var(--system-color-primary-contrast);
		}
	}

	.sidebar-icon {
		font-size: 1rem;
	}

	.main-content {
		flex: 1;
		overflow: auto;
		padding: 1rem;
	}

	.icons-view {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: 1rem;
	}

	.file-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		user-select: none;
		
		&:hover {
			background-color: hsla(var(--system-color-primary-hsl), 0.1);
		}
		
		&.selected {
			background-color: var(--system-color-primary);
			color: var(--system-color-primary-contrast);
		}
	}

	.file-icon {
		font-size: 2rem;
		margin-bottom: 0.25rem;
		
		&.small {
			font-size: 1rem;
			margin-bottom: 0;
		}
	}

	.file-name {
		font-size: 0.8rem;
		text-align: center;
		word-break: break-word;
		line-height: 1.2;
	}

	.list-view {
		display: flex;
		flex-direction: column;
	}

	.list-header {
		display: grid;
		grid-template-columns: 1fr 100px 150px;
		gap: 1rem;
		padding: 0.5rem 1rem;
		background-color: hsla(var(--system-color-dark-hsl), 0.05);
		border-radius: 0.25rem;
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--system-color-dark);
		margin-bottom: 0.5rem;
	}

	.list-item {
		display: grid;
		grid-template-columns: 1fr 100px 150px;
		gap: 1rem;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		cursor: pointer;
		user-select: none;
		
		&:hover {
			background-color: hsla(var(--system-color-primary-hsl), 0.1);
		}
		
		&.selected {
			background-color: var(--system-color-primary);
			color: var(--system-color-primary-contrast);
		}
	}

	.list-cell {
		display: flex;
		align-items: center;
		font-size: 0.9rem;
		
		&.name {
			gap: 0.5rem;
		}
	}
</style>