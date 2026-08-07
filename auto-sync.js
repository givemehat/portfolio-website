const fs = require('fs');
const { exec } = require('child_process');

let syncTimeout;

function sync() {
    console.log('Changes detected! Syncing to GitHub...');
    exec('git add . && git commit -m "Auto-sync update" && git push', (err, stdout, stderr) => {
        if (err) {
            // If the error is just "nothing to commit", ignore it
            if (!stdout.includes('nothing to commit') && !stderr.includes('nothing to commit')) {
                console.error('Error syncing:', stderr || err.message);
            }
        } else {
            console.log('✅ Successfully synced to GitHub at', new Date().toLocaleTimeString());
        }
    });
}

function onFileChange(eventType, filename) {
    // Ignore git internals and macOS system files
    if (filename && (filename.startsWith('.git') || filename.includes('.DS_Store'))) return;
    
    // Debounce the sync so it waits 5 seconds after you stop saving files
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(sync, 5000); 
}

// Watch the entire folder recursively
try {
    fs.watch('.', { recursive: true }, onFileChange);
    console.log('🚀 Auto-sync is now running!');
    console.log('Keep this terminal open. Any changes you save will automatically be pushed to GitHub.');
    console.log('(Press Ctrl+C to stop)');
} catch (e) {
    console.error('Failed to start watcher:', e.message);
}
